import { ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class ClubsAssignmentDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  clubs!: string[];
}
