import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  const testUser = {
    name: 'test_user',
    email: 'test@example.com',
    password: 'password-test',
  };
  const testUserLogin = { email: testUser.email, password: testUser.password };

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
    return request(app.getHttpServer()).get('/user').expect(200);
  });

  it('/user/1 (GET)', () => {
    return request(app.getHttpServer()).get('/user/1').expect(401);
  });

  it('/user (POST); /auth/login (POST) /user/:id (DELETE)', async () => {
    const id = await request(app.getHttpServer())
      .post('/user')
      .send(testUser)
      .expect(201)
      .then((res) => res.body.id);

    const accessToken = await request(app.getHttpServer())
      .post('/auth/login')
      .send(testUserLogin)
      .expect(201)
      .then((res) => res.body.accessToken);

    return request(app.getHttpServer())
      .delete(`/user/${id}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(204);
  });
});
