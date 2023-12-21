import { constants } from './constants';
import { TestApp } from './utils/app';
import { initializeApp } from './utils/initialize';
import { expectHistoryResponse } from './utils/matcher';

describe('HistoryController (e2e)', () => {
  let app: TestApp;
  beforeAll(async () => {
    app = new TestApp(await initializeApp());
  });
  afterAll(() => app.close());

  describe('History API', () => {
    let user;

    beforeAll(async () => {
      user = await app.createAndLoginUser(constants.user.test);
    });

    afterAll(async () => {
      await app.deleteUser(user.id, user.accessToken).expect(204);
    });

    it('should create a match', async () => {
      await app.createMatch(user.id, 10, 1, 5).expect(201);
      await app.createMatch(user.id, 8, 2, 10).expect(201);
    });

    it('should return 200 OK', async () => {
      await app
        .getHistory(user.id, user.accessToken)
        .expect(200)
        .expect(expectHistoryResponse);
    });
  });
});
