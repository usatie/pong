import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize Prisma client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  const userNames = ['Susami', 'Thara', 'Kakiba', 'Shongou', 'Test'];
  const userData = userNames.map((name) => ({
    email: `${name.toLowerCase()}@example.com`,
    name,
    password: bcrypt.hashSync(
      `password-${name.toLowerCase()}`,
      roundsOfHashing,
    ),
  }));
  const users = await Promise.all(
    userData.map(async (user) => {
      return await prisma.user.upsert({
        where: { email: user.email },
        update: {},
        create: user,
      });
    }),
  );

  const user1 = users[0];
  const user2 = users[1];
  const user3 = users[2];
  const user4 = users[3];
  const user5 = users[4];

  console.log({ user1, user2, user3, user4, user5 });

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

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // close Prisma Client at the end
    await prisma.$disconnect();
  });
