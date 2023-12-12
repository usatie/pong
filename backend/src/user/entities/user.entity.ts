import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';

export class UserEntity implements User {
  constructor(partial: Partial<UserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false, nullable: true })
  name: string | null;

  @Exclude()
  password: string;

  @ApiProperty({ required: false, nullable: true })
  avatarURL: string | null;

  @ApiProperty({ required: false, nullable: true })
  twoFactorSecret: string | null;

  @ApiProperty()
  twoFactorEnabled: boolean;
}
