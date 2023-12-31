import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import * as multer from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UserGuard } from 'src/user/user.guard';
import { AvatarService } from './avatar.service';
import { CreateAvatarDto } from './dto/create-avatar.dto';

@Controller()
@ApiTags('avatar')
export class AvatarController {
  constructor(private readonly avatarService: AvatarService) {}

  // Public
  @Get('avatar/:filename')
  findOne(@Param('filename') filename: string, @Res() res: Response) {
    // Validate filename
    // e.g. 1621234567890-1.png
    // e.g. default.png
    // e.g. 1621234567890-1.jpeg
    if (!filename.match(/^(default|(\d+)-\d+)\.(png|jpeg)$/)) {
      return res.status(404).send('Not found');
    }
    res.sendFile(filename, { root: 'public/avatar' });
  }

  // Private
  @Post('user/:userId/avatar')
  @UseInterceptors(
    FileInterceptor('avatar', {
      // File size limit
      limits: {
        fileSize: 1024 * 1024,
      },
      // File type filter
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Unsupported file type'), false);
        }
      },
      // Save file to public/avatar
      storage: multer.diskStorage({
        destination: './public/avatar',
        filename: (req, file, cb) => {
          const ext = file.mimetype.split('/')[1];
          const filename = `${Date.now()}-${req.params.userId}.${ext}`;
          cb(null, filename);
        },
      }),
    }),
  )
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  create(
    @Param('userId', ParseIntPipe) userId: number,
    @Body() createAvatarDto: CreateAvatarDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.avatarService.create(userId, file);
  }

  @Delete('user/:userId/avatar')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard, UserGuard)
  @ApiNoContentResponse()
  @ApiBearerAuth()
  remove(@Param('userId', ParseIntPipe) userId: number) {
    return this.avatarService.remove(userId);
  }
}
