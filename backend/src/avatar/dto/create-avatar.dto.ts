import { ApiProperty } from '@nestjs/swagger';

export class CreateAvatarDto {
  @ApiProperty({
    description: 'アップロードするファイル',
    type: 'file',
    properties: {
      file: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  avatar!: Express.Multer.File;
}
