import { HttpStatus, Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PaginationDto } from '../common';
import { AssignmentRepository } from './assignment.repository';
import { calculateAdminsChanges } from './utils';
import { Roles } from './enum';
import { NatsClientService } from '../transports/nats-client.service';

@Injectable()
export class AssignmentService {
  constructor(
    private readonly assignmentRepository: AssignmentRepository,
    private readonly natsClientService: NatsClientService,
  ) {}

  async create(createAssignmentDto: CreateAssignmentDto) {
    const { owners = [], clubs = [], ...data } = createAssignmentDto;

    const uniqueOwnerIds = await this.validateAdmins(
      Array.from(new Set(owners)),
      'ADMIN',
    );

    const uniqueClubIds = Array.from(new Set(clubs));

    const assignment = await this.assignmentRepository.create({
      ...data,
      owners: {
        create: uniqueOwnerIds.map((userId) => ({ userId })),
      },
      clubs: {
        create: uniqueClubIds.map((clubId) => ({ clubId })),
      },
    });

    if (uniqueOwnerIds.length > 0) {
      const eventRequests = uniqueOwnerIds.map((userId) =>
        this.natsClientService.emit('users.adding.assignment', {
          userId,
          assignmentId: assignment.id,
          role: Roles.ADMIN,
        }),
      );

      await Promise.all(eventRequests);
    }

    return assignment;
  }

  async findAll(paginationDto: PaginationDto) {
    try {
      const { page = 1, limit = 10 } = paginationDto;

      const [total, data] = await Promise.all([
        this.assignmentRepository.countAvailable(),
        this.assignmentRepository.findAll(page, limit),
      ]);

      const lastPage = Math.ceil(total / limit);

      return {
        data,
        meta: {
          total,
          page,
          lastPage,
        },
      };
    } catch (err: any) {
      throw new RpcException(err);
    }
  }

  async findOne(id: string) {
    const assignment = await this.assignmentRepository.findOne(id);
    if (!assignment) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Assignment not found',
      });
    }
    return assignment;
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
    const {
      id: _id,
      owners: ownerIds,
      clubs: clubIds,
      ...data
    } = updateAssignmentDto;

    const updateData: any = { ...data };

    if (ownerIds) {
      const assignment = await this.getAssignmentOrFail(id);
      const currentOwnerIds =
        assignment.owners?.map((owner) => owner.userId) ?? [];

      const validatedAdmins = await this.validateAdmins(
        Array.from(new Set(ownerIds)),
        'ADMIN',
      );

      const { addedAdmins, removedAdmins } = calculateAdminsChanges(
        currentOwnerIds,
        validatedAdmins,
      );

      if (addedAdmins.length || removedAdmins.length) {
        updateData.owners = {
          ...(removedAdmins.length && {
            deleteMany: { userId: { in: removedAdmins } },
          }),
          ...(addedAdmins.length && {
            createMany: {
              data: addedAdmins.map((userId) => ({ userId })),
            },
          }),
        };

        const eventRequests = [
          ...addedAdmins.map((adminId) =>
            this.natsClientService.emit('users.adding.assignment', {
              userId: adminId,
              assignmentId: id,
              role: Roles.ADMIN,
            }),
          ),
          ...removedAdmins.map((adminId) =>
            this.natsClientService.emit('users.remove.assignment', {
              userId: adminId,
              assignmentId: id,
              role: Roles.ADMIN,
            }),
          ),
        ];

        await Promise.all(eventRequests);
      }
    }

    if (!Object.keys(updateData).length) {
      return this.findOne(id);
    }

    return this.assignmentRepository.update(id, updateData);
  }

  async remove(id: string) {
    const assignmentExist = await this.assignmentRepository.findOne(id);
    if (!assignmentExist) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    return this.assignmentRepository.softDelete(id);
  }

  private async getAssignmentOrFail(id: string) {
    const assignment = await this.assignmentRepository.findOneWithOwners(id);

    if (!assignment) {
      throw new RpcException({
        status: HttpStatus.NOT_FOUND,
        message: 'Assignment not found',
      });
    }

    return assignment;
  }

  private async validateAdmins(
    users: string[],
    role: string,
  ): Promise<string[]> {
    if (!users.length) return [];

    const validatedAdmins = await this.natsClientService
      .send<string[]>('users.admin.validate', {
        ids: users,
        role,
      })
      .catch((err) => {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: err.message,
        });
      });

    return validatedAdmins;
  }

  async validateAssignment(id: string) {
    try {
      const assignment = await this.assignmentRepository.validateAssignment(id);
      if (!assignment) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Assignment is not valid',
        });
      }
      return assignment.id;
    } catch (err: any) {
      throw new RpcException(err);
    }
  }

  async findAssignmentByUser(id: string) {
    return await this.assignmentRepository.findManyWithOwners(id);
  }

  async addClubsToAssignment(assignmentId: string, clubs: string[]) {
    try {
      if (!clubs || clubs.length === 0) {
        throw new RpcException({
          status: HttpStatus.BAD_REQUEST,
          message: 'Clubs array cannot be empty',
        });
      }

      const assignment = await this.findOne(assignmentId);
      if (!assignment) {
        throw new RpcException({
          status: HttpStatus.NOT_FOUND,
          message: 'Assignment not found',
        });
      }

      const uniqueClubIds = Array.from(new Set(clubs));
      const clubAssignments =
        await this.assignmentRepository.addClubsToAssignment(
          assignmentId,
          uniqueClubIds,
        );

      return {
        message: `${clubAssignments.length} club(s) added to assignment successfully`,
        data: clubAssignments,
      };
    } catch (err: any) {
      throw new RpcException(err);
    }
  }
}
