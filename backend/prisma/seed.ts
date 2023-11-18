import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

// Initialize Prisma client
const prisma = new PrismaClient();

const roundsOfHashing = 10;

async function main() {
  const passwordSusami = await bcrypt.hash('password-susami', roundsOfHashing);
  const passwordThara = await bcrypt.hash('password-thara', roundsOfHashing);
  const passwordKakiba = await bcrypt.hash('password-kakiba', roundsOfHashing);
  const passwordShongou = await bcrypt.hash(
    'password-shongou',
    roundsOfHashing,
  );

  const user1 = await prisma.user.create({
    data: {
      email: 'susami@example.com',
      name: 'Susami',
      password: passwordSusami,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: 'thara@example.com',
      name: 'Thara',
      password: passwordThara,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: 'kakiba@example.com',
      name: 'Kakiba',
      password: passwordKakiba,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: 'shongou@example.com',
      name: 'Shongou',
      password: passwordShongou,
    },
  });

  console.log({ user1, user2, user3, user4 });

  const room1 = await prisma.room.create({
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
  const room2 = await prisma.room.create({
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
