import { Controller, Get } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Controller('todo')
export class TodoController {
	constructor(
		private prisma: PrismaService
	) {}

	@Get("list")
	async getList() {
		const result = await this.prisma.task.findMany();
		return [
			...result
		];
	}
}
