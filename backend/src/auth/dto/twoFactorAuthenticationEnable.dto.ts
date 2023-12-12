import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString, IsString, Length } from 'class-validator';

export class TwoFactorAuthenticationEnableDto {
  @Length(6, 6)
  @IsNumberString()
  @ApiProperty()
  code: string;
}
