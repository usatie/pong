import { IsNotEmpty, IsInt } from 'class-validator';

export class UpdateTaskDto {
  @IsNotEmpty()
  @IsInt()
  id: number;
}
