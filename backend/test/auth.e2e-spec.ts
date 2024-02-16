import { authenticator } from 'otplib';
import { constants } from './constants';
import { TestApp } from './utils/app';
import { initializeApp } from './utils/initialize';
import { expectPostGenerateTwoFactorAuthenticationSecretResponse } from './utils/matcher';

describe('AuthController (e2e)', () => {
  let app: TestApp;
  beforeAll(async () => {
    app = new TestApp(await initializeApp());
  });
  afterAll(() => app.close());

  it('should be defined', () => {
    expect(true).toBeTruthy();
  });

  describe('2FA', () => {
    let user;
    beforeAll(async () => {
      user = await app.createAndLoginUser(constants.user.test);
    });

    afterAll(async () => {
      await app.deleteUser(user.id, user.accessToken).expect(204);
    });

    let secret;
    it('[POST /auth/2fa/generate] should generate 2FA secret', async () => {
      await app
        .generateTwoFactorAuthenticationSecret(user.accessToken)
        .expect(201)
        .expect(expectPostGenerateTwoFactorAuthenticationSecretResponse);
    });

    it('[POST /auth/2fa/generate] should generate 2FA secret again', async () => {
      const res = await app
        .generateTwoFactorAuthenticationSecret(user.accessToken)
        .expect(201)
        .expect(expectPostGenerateTwoFactorAuthenticationSecretResponse);
      // Extract secret from res.body (QR code)
      secret = res.body.secret;
    });

    it('[POST /auth/2fa/enable] should enable 2FA', async () => {
      const code = authenticator.generate(secret);
      await app
        .enableTwoFactorAuthentication(code, user.accessToken)
        .expect(200);
    });

    it('[POST /auth/2fa/enable] should not enable if 2FA is already enabled', async () => {
      const code = authenticator.generate(secret);
      await app
        .enableTwoFactorAuthentication(code, user.accessToken)
        .expect(409);
    });

    it('[POST /auth/2fa/generate] should not generate 2FA secret if 2FA is already enabled', async () => {
      await app
        .generateTwoFactorAuthenticationSecret(user.accessToken)
        .expect(409);
    });

    it('[GET /user/me] should return 401 if 2FA is enabled but no code is provided', async () => {
      await app.getMe(user.accessToken).expect(401);
    });

    it('[POST /auth/2fa/authenticate] should authenticate 2FA', async () => {
      const code = authenticator.generate(secret);
      const res = await app
        .twoFactorAuthenticate(code, user.accessToken)
        .expect(200);
      user.accessToken = res.body.accessToken;
    });

    it('[GET /user/me] should return 200 if 2FA is enabled and code is provided', async () => {
      await app.getMe(user.accessToken).expect(200);
    });

    it('[DELETE /auth/2fa/disable] should disable 2FA', async () => {
      await app.disableTwoFactorAuthentication(user.accessToken).expect(200);
    });

    it('[POST /auth/2fa/enable] should re-enable 2FA', async () => {
      const code = authenticator.generate(secret);
      await app
        .enableTwoFactorAuthentication(code, user.accessToken)
        .expect(200);
    });
  });
});
