import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const tasks = ['Buy milk', 'Write a blog post', 'Go for a run'];

  await Promise.all(
    tasks.map((task) => {
      return prisma.task.create({
        data: {
          title: task,
        },
      });
    }),
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
