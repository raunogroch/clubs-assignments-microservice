import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AssignmentService } from './assignment.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { PaginationDto } from '../common';
import { ClubsAssignmentDto } from './dto';

@Controller()
export class AssignmentController {
  constructor(private readonly assignmentService: AssignmentService) {}

  @MessagePattern('assignment.create')
  create(@Payload() createAssignmentDto: CreateAssignmentDto) {
    return this.assignmentService.create(createAssignmentDto);
  }

  @MessagePattern('assignment.findAll')
  findAll(@Payload() paginationDto: PaginationDto) {
    return this.assignmentService.findAll(paginationDto);
  }

  @MessagePattern('assignment.findOne')
  findOne(@Payload() id: string) {
    return this.assignmentService.findOne(id);
  }

  @MessagePattern('assignment.update')
  update(@Payload() updateAssignmentDto: UpdateAssignmentDto) {
    return this.assignmentService.update(
      updateAssignmentDto.id,
      updateAssignmentDto,
    );
  }

  @MessagePattern('assignment.remove')
  remove(@Payload() id: string) {
    return this.assignmentService.remove(id);
  }

  @MessagePattern('assignment.validate')
  validateAssignment(@Payload() id: string) {
    return this.assignmentService.validateAssignment(id);
  }

  @MessagePattern('assignment.findByUser')
  findAssignmentByUser(@Payload() id: string) {
    return this.assignmentService.findAssignmentByUser(id);
  }

  @MessagePattern('assignment.addClubs')
  addClubsToAssignment(@Payload() clubsAssignmentDto: ClubsAssignmentDto) {
    return this.assignmentService.addClubsToAssignment(
      clubsAssignmentDto.id,
      clubsAssignmentDto.clubs,
    );
  }
}
