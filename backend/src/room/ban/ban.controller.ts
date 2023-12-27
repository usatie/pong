import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BanService } from './ban.service';
import { CreateBanDto } from './dto/create-ban.dto';
import { UpdateBanDto } from './dto/update-ban.dto';

@Controller('ban')
export class BanController {
  constructor(private readonly banService: BanService) {}

  @Post()
  create(@Body() createBanDto: CreateBanDto) {
    return this.banService.create(createBanDto);
  }

  @Get()
  findAll() {
    return this.banService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.banService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBanDto: UpdateBanDto) {
    return this.banService.update(+id, updateBanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.banService.remove(+id);
  }
}
