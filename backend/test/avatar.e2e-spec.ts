import * as request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { initializeApp } from './utils/initialize';
import * as path from 'path';
import * as fs from 'fs';

export function expectFile(filepath: string) {
  return (res: request.Response) => {
    const expected = fs.readFileSync(filepath);
    expect(res.body).toEqual(expected);
  };
}

describe('UserController (e2e)', () => {
  let app: INestApplication;
  beforeAll(async () => {
    app = await initializeApp();
  });
  afterAll(() => app.close());

  /* Avatar API */
  const getAvatar = (filename: string) => {
    return request(app.getHttpServer()).get(`/avatar/${filename}`);
  };

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
});
