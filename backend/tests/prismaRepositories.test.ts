import { PrismaClient } from '@prisma/client';
import { PrismaQuizRepository } from '../src/repositories/quizRepository';
import { PrismaUserRepository } from '../src/repositories/userRepository';

describe('PrismaUserRepository', () => {
  const prisma = { user: { findUnique: jest.fn(), create: jest.fn() } };
  const repo = new PrismaUserRepository(prisma as unknown as PrismaClient);

  it('finds a user by email', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: '1' });
    expect(await repo.findByEmail('a@b.com')).toEqual({ id: '1' });
    expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email: 'a@b.com' } });
  });

  it('creates a user', async () => {
    const data = { email: 'a@b.com', passwordHash: 'hash' };
    prisma.user.create.mockResolvedValue({ id: '1', ...data });
    await repo.create(data);
    expect(prisma.user.create).toHaveBeenCalledWith({ data });
  });
});

describe('PrismaQuizRepository', () => {
  const prisma = {
    quiz: { create: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
  };
  const repo = new PrismaQuizRepository(prisma as unknown as PrismaClient);
  const date = new Date();

  const row = {
    id: 'q1',
    title: 'T',
    authorId: 'u1',
    createdAt: date,
    questions: [
      {
        id: 'qq1',
        quizId: 'q1',
        position: 0,
        type: 'CHECKBOX',
        text: 'Pick',
        correctBoolean: null,
        correctText: null,
        options: [{ id: 'o1', questionId: 'qq1', position: 0, text: 'A', isCorrect: true }],
      },
    ],
  };

  it('creates a quiz with nested questions for every type and maps the result', async () => {
    prisma.quiz.create.mockResolvedValue(row);

    const quiz = await repo.create('u1', {
      title: 'T',
      questions: [
        { type: 'BOOLEAN', text: 'b', correctBoolean: false },
        { type: 'INPUT', text: 'i' },
        { type: 'INPUT', text: 'i2', correctText: 'x' },
        {
          type: 'CHECKBOX',
          text: 'c',
          options: [
            { text: 'A', isCorrect: true },
            { text: 'B', isCorrect: false },
          ],
        },
      ],
    });

    const { data } = prisma.quiz.create.mock.calls[0][0];
    expect(data.authorId).toBe('u1');
    expect(data.questions.create).toEqual([
      { type: 'BOOLEAN', text: 'b', position: 0, correctBoolean: false },
      { type: 'INPUT', text: 'i', position: 1, correctText: null },
      { type: 'INPUT', text: 'i2', position: 2, correctText: 'x' },
      {
        type: 'CHECKBOX',
        text: 'c',
        position: 3,
        options: {
          create: [
            { text: 'A', isCorrect: true, position: 0 },
            { text: 'B', isCorrect: false, position: 1 },
          ],
        },
      },
    ]);
    expect(quiz.questions[0].options[0]).toEqual({ id: 'o1', text: 'A', isCorrect: true });
    expect(quiz.questions[0]).not.toHaveProperty('position');
  });

  it('lists quizzes with question counts', async () => {
    prisma.quiz.findMany.mockResolvedValue([
      { id: 'q1', title: 'T', authorId: 'u1', createdAt: date, _count: { questions: 4 } },
    ]);
    expect(await repo.findAll()).toEqual([
      { id: 'q1', title: 'T', authorId: 'u1', createdAt: date, questionsCount: 4 },
    ]);
  });

  it('finds a quiz by id', async () => {
    prisma.quiz.findUnique.mockResolvedValue(row);
    expect((await repo.findById('q1'))?.id).toBe('q1');
  });

  it('returns null when the quiz does not exist', async () => {
    prisma.quiz.findUnique.mockResolvedValue(null);
    expect(await repo.findById('missing')).toBeNull();
  });

  it('deletes a quiz', async () => {
    prisma.quiz.delete.mockResolvedValue(row);
    await repo.delete('q1');
    expect(prisma.quiz.delete).toHaveBeenCalledWith({ where: { id: 'q1' } });
  });
});