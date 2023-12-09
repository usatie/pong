import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UseGuards,
  Put,
  Param,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { AvatarService } from './avatar.service';
import { UpdateAvatarDto } from './dto/update-avatar.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserGuard } from 'src/user/user.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import * as multer from 'multer';

@Controller()
@ApiTags('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  // Public
  @Get('avatar/:filename')
  findOne(@Param('filename') filename: string, @Res() res: Response) {
    res.sendFile(filename, { root: 'public/avatar' });
  }

  // Private
  @Post('user/:userId/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: multer.diskStorage({
        destination: './public/avatar',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${req.params.userId}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.avatarService.create(userId, file);
  }

  @Put('user/:userId/avatar')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  update(@Body() updateAvatarDto: UpdateAvatarDto) {
    return this.avatarService.update(updateAvatarDto);
  }

  @Delete('user/:userId/avatar')
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiBearerAuth()
  remove() {
    ///
    return this.avatarService.remove(0);
  }
}
