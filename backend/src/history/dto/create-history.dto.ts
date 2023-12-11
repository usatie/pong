import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, ValidateNested } from 'class-validator';

class Score {
  @IsNumber()
  @ApiProperty()
  userId: number;

  @IsNumber()
  @ApiProperty()
  score: number;
}

export class CreateHistoryDto {
  @ValidateNested()
  @Type(() => Score)
  @ApiProperty({ type: Score })
  winner: Score;

  @ValidateNested()
  @Type(() => Score)
  @ApiProperty({ type: Score })
  loser: Score;
}
