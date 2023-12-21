import * as fs from 'fs';
import * as path from 'path';
import { constants } from './constants';
import { TestApp } from './utils/app';
import { initializeApp } from './utils/initialize';
import { expectFile } from './utils/matcher';

describe('AvatarController (e2e)', () => {
  let app: TestApp;
  beforeAll(async () => {
    app = new TestApp(await initializeApp());
  });
  afterAll(() => app.close());

  it('should be defined', () => {
    expect(true).toBeTruthy();
  });

  describe('GET /avatar/default.png', () => {
    it('should return 200 OK', async () => {
      const expectedFilePath = path.join(
        __dirname,
        '../public/avatar/default.png',
      );
      await app
        .getAvatar('default.png')
        .expect(200)
        .expect(expectFile(expectedFilePath));
    });
  });

  describe('POST /user/:userId/avatar', () => {
    let user;
    beforeAll(async () => {
      user = await app.createAndLoginUser(constants.user.test);
    });

    afterAll(async () => {
      await app.deleteUser(user.id, user.accessToken).expect(204);
    });

    let uploadedFileName;
    it('should upload avatar', async () => {
      const expectedFilePath = path.join(
        __dirname,
        '../public/avatar/default.png',
      );
      const res = await app
        .uploadAvatar(user.id, expectedFilePath, user.accessToken)
        .expect(201)
        .expect((res) => expect(res.body.filename).toBeDefined());
      const filename = res.body.filename;
      const expected = fs.readFileSync(expectedFilePath);
      const uploaded = fs.readFileSync(
        path.join(__dirname, '../public/avatar', filename),
      );
      expect(uploaded).toEqual(expected);
      uploadedFileName = filename;
    });

    it('should delete old avatar', async () => {
      await app.getAvatar(uploadedFileName).expect(200);
      await app.deleteAvatar(user.id, user.accessToken).expect(204);
      await app.getAvatar(uploadedFileName).expect(404);
    });
  });
});
