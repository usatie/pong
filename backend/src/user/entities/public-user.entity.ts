import { ApiProperty } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class PublicUserEntity implements User {
  constructor(partial: Partial<PublicUserEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: number;

  @Exclude()
  email: string;

  @ApiProperty()
  name: string;

  @Exclude()
  password: string;

  @ApiProperty({ required: false, nullable: true })
  avatarURL: string | null;

  @Exclude()
  twoFactorSecret: string | null;

  @Exclude()
  twoFactorEnabled: boolean;
}
