import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: { email: 'demo@example.com', passwordHash },
  });

  await prisma.quiz.create({
    data: {
      title: 'Sample quiz',
      authorId: user.id,
      questions: {
        create: [
          {
            type: 'BOOLEAN',
            text: 'TypeScript is a superset of JavaScript.',
            position: 0,
            correctBoolean: true,
          },
          {
            type: 'INPUT',
            text: 'What does HTML stand for?',
            position: 1,
            correctText: 'HyperText Markup Language',
          },
          {
            type: 'CHECKBOX',
            text: 'Which of these are JavaScript libraries or frameworks?',
            position: 2,
            options: {
              create: [
                { text: 'React', isCorrect: true, position: 0 },
                { text: 'Express', isCorrect: true, position: 1 },
                { text: 'PostgreSQL', isCorrect: false, position: 2 },
                { text: 'Docker', isCorrect: false, position: 3 },
              ],
            },
          },
        ],
      },
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());