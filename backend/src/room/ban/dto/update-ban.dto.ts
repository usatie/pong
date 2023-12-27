import { PartialType } from '@nestjs/mapped-types';
import { CreateBanDto } from './create-ban.dto';

export class UpdateBanDto extends PartialType(CreateBanDto) {}
