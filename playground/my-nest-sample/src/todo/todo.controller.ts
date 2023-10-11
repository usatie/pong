import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './create-task.dto';
import { UpdateTaskDto } from './update-task.dto';

@Controller('todo')
export class TodoController {
  constructor(private prisma: PrismaService) {}

  @Get('list')
  async getList() {
    const result = await this.prisma.task.findMany({
      where: { is_done: false },
    });
    return [...result];
  }

  @Post('')
  async add(@Body() task: CreateTaskDto) {
    const result = await this.prisma.task.create({
      data: task,
    });
    return {
      status: 'ok',
    };
  }

  @Post(':id/done')
  async done(@Param() param: UpdateTaskDto) {
    await this.prisma.task.update({
      where: { id: param.id },
      data: { is_done: true },
    });
    return { status: 'ok' };
  }
}
