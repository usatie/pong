import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;

  @ApiProperty()
  password: string;
}
