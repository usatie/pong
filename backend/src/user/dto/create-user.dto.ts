import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @ApiProperty({
    type: String,
    description: 'Email of the user',
    format: 'email',
  })
  email: string;

  @IsString()
  @MaxLength(255)
  @MinLength(3)
  @ApiProperty({
    type: String,
    description: 'Name of the user',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  @ApiProperty()
  password: string;
}
