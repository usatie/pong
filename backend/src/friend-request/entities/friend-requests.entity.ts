import { ApiProperty } from '@nestjs/swagger';
import { PublicUserEntity } from 'src/user/entities/public-user.entity';

export class FriendRequestsEntity {
  constructor(partial: Partial<FriendRequestsEntity>) {
    this.requestedBy =
      partial.requestedBy?.map((user) => new PublicUserEntity(user)) ?? [];
    this.requesting =
      partial.requesting?.map((user) => new PublicUserEntity(user)) ?? [];
  }

  @ApiProperty()
  requestedBy: PublicUserEntity[];

  @ApiProperty()
  requesting: PublicUserEntity[];
}
