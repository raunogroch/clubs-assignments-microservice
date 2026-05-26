import { Module } from '@nestjs/common';
import { AssignmentService } from './assignment.service';
import { AssignmentController } from './assignment.controller';
import { AssignmentRepository } from './assignment.repository';
import { NatsModule } from '../transports/nats.module';
import { PrismaService } from '../prisma.service';

@Module({
  imports: [NatsModule],
  controllers: [AssignmentController],
  providers: [AssignmentService, AssignmentRepository, PrismaService],
})
export class AssignmentModule {}
