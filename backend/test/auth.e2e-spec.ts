import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { initializeApp } from './utils/initialize';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { constants } from './constants';
import { LoginDto } from 'src/auth/dto/login.dto';
import { authenticator } from 'otplib';

describe('AuthController (e2e)', () => {
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

  const generateTwoFactorAuthenticationSecret = (accessToken: string) => {
    return request(app.getHttpServer())
      .post('/auth/2fa/generate')
      .set('Authorization', `Bearer ${accessToken}`);
  };

  const enableTwoFactorAuthentication = (accessToken: string, code: string) => {
    return request(app.getHttpServer())
      .post('/auth/2fa/enable')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ code });
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

  describe('POST /auth/2fa/generate', () => {
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

    let secret;
    it('should generate 2FA secret', async () => {
      const res = await generateTwoFactorAuthenticationSecret(accessToken);
      expect(res.status).toBe(201);
      const expected = {
        secret: expect.any(String),
        otpAuthUrl: expect.any(String),
      };
      expect(res.body).toEqual(expected);
      // Extract secret from res.body (QR code)
      secret = res.body.secret;
    });

    it('should not generate 2FA secret if 2FA is already enabled', async () => {
      await generateTwoFactorAuthenticationSecret(accessToken).expect(401);
    });

    it('should enable 2FA', async () => {
      const code = authenticator.generate(secret);
      await enableTwoFactorAuthentication(accessToken, code).expect(200);
    });

    it('should not enable 2FA if 2FA is already enabled', async () => {
      const code = authenticator.generate(secret);
      await enableTwoFactorAuthentication(accessToken, code).expect(401);
    });
  });
});
