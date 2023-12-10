import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { initializeApp } from './utils/initialize';
import * as path from 'path';
import * as fs from 'fs';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { constants } from './constants';
import { LoginDto } from 'src/auth/dto/login.dto';
import { get } from 'http';

export function expectFile(filepath: string) {
  return (res: request.Response) => {
    const expected = fs.readFileSync(filepath);
    expect(res.body).toEqual(expected);
  };
}

describe('AvatarController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await initializeApp();
  });
  afterAll(() => app.close());

  /* User API */
  const deleteUser = (id: number) => {
    return request(app.getHttpServer()).delete(`/user/${id}`);
  };

  const createUser = (user: CreateUserDto) => {
    return request(app.getHttpServer()).post('/user').send(user);
  };

  /* Auth API */
  const login = (login: LoginDto) => {
    return request(app.getHttpServer()).post('/auth/login').send(login);
  };

  /* Avatar API */
  const getAvatar = (filename: string) => {
    return request(app.getHttpServer()).get(`/avatar/${filename}`);
  };

  const uploadAvatar = (
    userId: number,
    filepath: string,
    accessToken: string,
  ) => {
    return request(app.getHttpServer())
      .post(`/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${accessToken}`)
      .attach('avatar', filepath);
  };

  const deleteAvatar = (userId: number, accessToken: string) => {
    return request(app.getHttpServer())
      .delete(`/user/${userId}/avatar`)
      .set('Authorization', `Bearer ${accessToken}`);
  };

  /* Utils */
  const getUserIdFromAccessToken = (accessToken: string) => {
    const payloadBase64 = accessToken.split('.')[1];
    const payloadBuf = Buffer.from(payloadBase64, 'base64');
    const payloadString = payloadBuf.toString('utf-8');
    const payload = JSON.parse(payloadString);
    return payload.userId;
  };

  it('should be defined', () => {
    expect(true).toBeTruthy();
  });

  describe('GET /avatar/default.png', () => {
    it('should return 200 OK', async () => {
      const expectedFilePath = path.join(
        __dirname,
        '../public/avatar/default.png',
      );
      await getAvatar('default.png')
        .expect(200)
        .expect(expectFile(expectedFilePath));
    });
  });

  describe('POST /user/:userId/avatar', () => {
    let userId: number;
    let accessToken: string;

    beforeAll(async () => {
      // Create user
      let res = await createUser(constants.user.test);

      // Login
      const loginDto: LoginDto = {
        email: constants.user.test.email,
        password: constants.user.test.password,
      };
      res = await login(loginDto).expect(201);
      accessToken = res.body.accessToken;
      userId = getUserIdFromAccessToken(accessToken);
    });

    afterAll(async () => {
      await deleteUser(userId).set('Authorization', `Bearer ${accessToken}`);
    });

    let uploadedFileName;
    it('should upload avatar', async () => {
      const expectedFilePath = path.join(
        __dirname,
        '../public/avatar/default.png',
      );
      const res = await uploadAvatar(userId, expectedFilePath, accessToken)
        .expect(201)
        .expect((res) => expect(res.body.filename).toBeDefined());
      const expected = fs.readFileSync(expectedFilePath);
      const uploaded = fs.readFileSync(
        path.join(__dirname, '../public/avatar', res.body.filename),
      );
      expect(uploaded).toEqual(expected);
      uploadedFileName = res.body.filename;
    });

    it('should delete old avatar', async () => {
      await deleteAvatar(userId, accessToken).expect(204);
      getAvatar(uploadedFileName).expect(404);
    });
  });
});
