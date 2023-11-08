import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('/user (GET)', () => {
    return request(app.getHttpServer())
      .get('/user')
      .expect(200);
  });

  it('/user/1 (GET)', () => {
    return request(app.getHttpServer())
      .get('/user/1')
      .expect(401);
  });

  let userId;
  it('/user (POST)', () => {
    return request(app.getHttpServer())
      .post('/user')
      .send({
        email: "test@email.com",
        name: "test_user",
        password: "password-test"
      })
      .expect(201)
      .then(response => {
        userId = response.body.userId;
      });
  });

  it('/auth/login (POST)', () => {
    return request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "test@email.com",
        password: "password-test"
      })
      .expect(201);
  });

  it('/user/:id (DELETE)', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: "test@email.com",
        password: "password-test"
      })
      .expect(201);
    const { accessToken } = res.body;
    return request(app.getHttpServer())
      .delete(`/user/${userId}`)
      .set("Authorization", `Bearer ${accessToken}`)
      .expect(204);
  });
});
