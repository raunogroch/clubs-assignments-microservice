import { ArrayUnique, IsArray, IsNotEmpty, IsString } from 'class-validator';

export class OwnersAssignmentDto {
  @IsNotEmpty()
  @IsString()
  id!: string;

  @IsArray()
  @ArrayUnique()
  @IsString({ each: true })
  owners!: string[];
}
