import { Controller, Get } from '@nestjs/common';

@Controller('todo')
export class TodoController {
	@Get("list")
	getList() {
		return [
			{
				title: "Buy a bottle of milk",
				due_on: "2023-10-15",
				done: false
			}	
		];
	}
}
