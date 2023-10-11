// `POST` `/todo` が受け取るリクエストの定義
import {IsNotEmpty} from "class-validator"

export class CreateTaskDto {
	@IsNotEmpty()
	title: string;
}
