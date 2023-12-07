import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { initializeApp } from './utils/initialize';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await initializeApp();
  });

  describe('/ (GET)', () => {
    it('should return "Hello World!"', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });
});
