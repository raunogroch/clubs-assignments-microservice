import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma.service';

@Injectable()
export class AssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: Prisma.AssignmentCreateInput) {
    return this.prisma.assignment.create({
      data,
      include: {
        owners: true,
        clubs: true,
      },
    });
  }

  countAvailable() {
    return this.prisma.assignment.count({
      where: { available: true },
    });
  }

  findAll(page: number, limit: number) {
    return this.prisma.assignment.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: { available: true },
      include: {
        owners: true,
        clubs: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      include: {
        owners: true,
        clubs: true,
      },
    });
  }

  update(id: string, data: Prisma.AssignmentUpdateInput) {
    return this.prisma.assignment.update({
      where: { id },
      data,
      include: {
        owners: true,
        clubs: true,
      },
    });
  }

  softDelete(id: string) {
    return this.prisma.assignment.update({
      where: { id },
      data: { available: false },
    });
  }

  findOneWithOwners(id: string) {
    return this.prisma.assignment.findUnique({
      where: { id },
      select: {
        id: true,
        owners: true,
      },
    });
  }

  validateAssignment(id: string) {
    return this.prisma.assignment.findFirst({
      where: { id, available: true },
      select: { id: true },
    });
  }

  findManyWithOwners(userId: string) {
    return this.prisma.assignment.findMany({
      where: {
        owners: {
          some: {
            userId: userId,
          },
        },
        available: true,
      },
      select: {
        id: true,
        name: true,
        owners: true,
        clubs: true,
      },
    });
  }
}
