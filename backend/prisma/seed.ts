import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize Prisma client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  const passwordHashes = await Promise.all([
    bcrypt.hash('password-susami', roundsOfHashing),
    bcrypt.hash('password-thara', roundsOfHashing),
    bcrypt.hash('password-kakiba', roundsOfHashing),
    bcrypt.hash('password-shongou', roundsOfHashing),
  ]);

  const user1 = await prisma.user.create({
    data: {
      email: 'susami@example.com',
      name: 'Susami',
      password: passwordHashes[0],
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'thara@example.com',
      name: 'Thara',
      password: passwordHashes[1],
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'kakiba@example.com',
      name: 'Kakiba',
      password: passwordHashes[2],
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'shongou@example.com',
      name: 'Shongou',
      password: passwordHashes[3],
    },
  });

  console.log({ user1, user2, user3, user4 });

  await prisma.room.create({
    data: {
      name: 'Room 1',
      users: {
        connect: [
          { id: user1.id },
          { id: user2.id },
          { id: user3.id },
          { id: user4.id },
        ],
      },
    },
  });
  await prisma.room.create({
    data: {
      name: 'Room 2',
      users: {
        connect: [{ id: user1.id }, { id: user2.id }, { id: user4.id }],
      },
    },
  });
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
