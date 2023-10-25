import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import * as pgPromise from 'pg-promise';

const pgp = pgPromise({});
// postgres://user:password@host:port/database
const db = pgp(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@db:5432/${process.env.POSTGRES_DB}`);

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
