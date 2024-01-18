import { PartialType } from '@nestjs/mapped-types';
import { CreateMuteDto } from './create-mute.dto';

export class UpdateMuteDto extends PartialType(CreateMuteDto) {}
