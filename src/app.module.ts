import { Module } from '@nestjs/common';
import { AssignmentModule } from './assignment/assignment.module';

@Module({
  imports: [AssignmentModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
