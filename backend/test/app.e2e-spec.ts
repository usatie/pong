import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { PrismaClientExceptionFilter } from 'nestjs-prisma';
import { HttpAdapterHost, Reflector } from '@nestjs/core';

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
    app.useGlobalPipes(new ValidationPipe({ whitelist: true })); // enable validation
    app.useGlobalInterceptors(
      new ClassSerializerInterceptor(app.get(Reflector)),
    ); // enable serialization
    const { httpAdapter } = app.get(HttpAdapterHost);
    app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
    await app.init();
  });

  describe('/ (GET)', () => {
    it('should return "Hello World!"', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  describe('/user', () => {
    describe('Without authentiation', () => {
      it('GET /user should return users list', () => {
        return request(app.getHttpServer()).get('/user').expect(200);
      });

      it('GET /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).get('/user/1').expect(401);
      });

      it('PATCH /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).patch('/user/1').expect(401);
      });

      it('DELETE /user/:id should return 401 Unauthorized', () => {
        return request(app.getHttpServer()).delete('/user/1').expect(401);
      });
    });

    describe('With authentication', () => {
      let id: number;
      let accessToken: string;

      beforeAll(async () => {
        id = await request(app.getHttpServer())
          .post('/user')
          .send(testUser)
          .expect(201)
          .then((res) => res.body.id);

        accessToken = await request(app.getHttpServer())
          .post('/auth/login')
          .send(testUserLogin)
          .expect(201)
          .then((res) => res.body.accessToken);
      });

      afterAll(async () => {
        await request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`);
      });

      it('GET /user/:id should return the user', () => {
        const { password, ...expectedUser } = { ...testUser, id };
        return request(app.getHttpServer())
          .get(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(200)
          .expect(expectedUser);
      });

      it('PATCH /user/:id should update the user', () => {
        const { password, ...updatedUser } = {
          ...testUser,
          id,
          name: 'new_name',
        };
        return request(app.getHttpServer())
          .patch(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .send(updatedUser)
          .expect(200)
          .expect(updatedUser);
      });

      it('DELETE /user/:id should delete the user', () => {
        return request(app.getHttpServer())
          .delete(`/user/${id}`)
          .set('Authorization', `Bearer ${accessToken}`)
          .expect(204);
      });
    });
  });
});
