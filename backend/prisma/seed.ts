import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize Prisma client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function seedUsers() {
  const userNames = ['Susami', 'Thara', 'Kakiba', 'Shongou', 'Test'];
  const userData = userNames.map((name) => ({
    email: `${name.toLowerCase()}@example.com`,
    name,
    password: bcrypt.hashSync(
      `password-${name.toLowerCase()}`,
      roundsOfHashing,
    ),
    avatarURL: `/avatar/${name.toLowerCase()}.jpg`,
  }));
  userData[4].avatarURL = '/avatar/default.png';
  return Promise.all(
    userData.map(async (user) => {
      return await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }),
  );
}

async function seedRooms(users) {
  const user1 = users[0];
  const user2 = users[1];
  const user3 = users[2];
  const user4 = users[3];

  // Difficult to use upsert because of there is no unique key other than autoincrement id
  if ((await prisma.room.count()) == 0) {
    await prisma.room.create({
      data: {
        name: 'Room 1',
        users: {
          create: [
            { userId: user1.id, role: 'OWNER' },
            { userId: user2.id, role: 'ADMINISTRATOR' },
            { userId: user3.id, role: 'MEMBER' },
            { userId: user4.id, role: 'MEMBER' },
          ],
        },
      },
    });
    await prisma.room.create({
      data: {
        name: 'Room 2',
        users: {
          create: [
            { userId: user1.id, role: 'MEMBER' },
            { userId: user2.id, role: 'MEMBER' },
            { userId: user4.id, role: 'OWNER' },
          ],
        },
      },
    });
  }
}

async function seedMatchHistory() {
  const dtos = [
    { winner: { userId: 1, score: 10 }, loser: { userId: 2, score: 4 } },
    { winner: { userId: 1, score: 10 }, loser: { userId: 3, score: 7 } },
    { winner: { userId: 1, score: 10 }, loser: { userId: 4, score: 3 } },
    { winner: { userId: 1, score: 10 }, loser: { userId: 5, score: 4 } },
    { winner: { userId: 2, score: 10 }, loser: { userId: 1, score: 5 } },
    { winner: { userId: 2, score: 10 }, loser: { userId: 3, score: 2 } },
    { winner: { userId: 2, score: 10 }, loser: { userId: 4, score: 1 } },
    { winner: { userId: 2, score: 10 }, loser: { userId: 5, score: 2 } },
    { winner: { userId: 3, score: 10 }, loser: { userId: 1, score: 0 } },
    { winner: { userId: 3, score: 10 }, loser: { userId: 2, score: 0 } },
    { winner: { userId: 3, score: 10 }, loser: { userId: 4, score: 2 } },
    { winner: { userId: 3, score: 10 }, loser: { userId: 5, score: 2 } },
    { winner: { userId: 4, score: 10 }, loser: { userId: 1, score: 5 } },
    { winner: { userId: 4, score: 10 }, loser: { userId: 2, score: 0 } },
    { winner: { userId: 4, score: 10 }, loser: { userId: 3, score: 2 } },
    { winner: { userId: 4, score: 10 }, loser: { userId: 5, score: 2 } },
    { winner: { userId: 5, score: 10 }, loser: { userId: 1, score: 5 } },
  ];

  return Promise.all(
    dtos.map((dto) =>
      prisma.match.create({
        data: {
          players: {
            create: [
              {
                userId: dto.winner.userId,
                score: dto.winner.score,
                winLose: 'WIN',
              },
              {
                userId: dto.loser.userId,
                score: dto.loser.score,
                winLose: 'LOSE',
              },
            ],
          },
          result: 'COMPLETE',
        },
      }),
    ),
  );
}

async function main() {
  const users = await seedUsers();
  await seedRooms(users);
  await seedMatchHistory();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
