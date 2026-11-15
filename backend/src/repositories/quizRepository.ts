import { Prisma, PrismaClient } from '@prisma/client';
import { CreateQuizInput } from '../schemas/quiz';
import { Quiz } from '../types/quiz.type';
import { QuizSummary } from '../types/quiz-summary.type';

export interface QuizRepository {
  create(authorId: string, input: CreateQuizInput): Promise<Quiz>;
  findAll(): Promise<QuizSummary[]>;
  findById(id: string): Promise<Quiz | null>;
  delete(id: string): Promise<void>;
}

const quizInclude = {
  questions: {
    orderBy: { position: 'asc' },
    include: { options: { orderBy: { position: 'asc' } } },
  },
} satisfies Prisma.QuizInclude;

type QuizRow = Prisma.QuizGetPayload<{ include: typeof quizInclude }>;

function mapQuiz(row: QuizRow): Quiz {
  return {
    id: row.id,
    title: row.title,
    authorId: row.authorId,
    createdAt: row.createdAt,
    questions: row.questions.map((q) => ({
      id: q.id,
      type: q.type,
      text: q.text,
      correctBoolean: q.correctBoolean,
      correctText: q.correctText,
      options: q.options.map((o) => ({ id: o.id, text: o.text, isCorrect: o.isCorrect })),
    })),
  };
}

function toQuestionCreate(
  q: CreateQuizInput['questions'][number],
  position: number,
): Prisma.QuestionCreateWithoutQuizInput {
  switch (q.type) {
    case 'BOOLEAN':
      return { type: 'BOOLEAN', text: q.text, position, correctBoolean: q.correctBoolean };
    case 'INPUT':
      return { type: 'INPUT', text: q.text, position, correctText: q.correctText ?? null };
    case 'CHECKBOX':
      return {
        type: 'CHECKBOX',
        text: q.text,
        position,
        options: {
          create: q.options.map((o, i) => ({ text: o.text, isCorrect: o.isCorrect, position: i })),
        },
      };
  }
}

export class PrismaQuizRepository implements QuizRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(authorId: string, input: CreateQuizInput): Promise<Quiz> {
    const row = await this.prisma.quiz.create({
      data: {
        title: input.title,
        authorId,
        questions: { create: input.questions.map(toQuestionCreate) },
      },
      include: quizInclude,
    });
    return mapQuiz(row);
  }

  async findAll(): Promise<QuizSummary[]> {
    const rows = await this.prisma.quiz.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        authorId: true,
        createdAt: true,
        _count: { select: { questions: true } },
      },
    });
    return rows.map(({ _count, ...rest }) => ({ ...rest, questionsCount: _count.questions }));
  }

  async findById(id: string): Promise<Quiz | null> {
    const row = await this.prisma.quiz.findUnique({ where: { id }, include: quizInclude });
    return row ? mapQuiz(row) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.quiz.delete({ where: { id } });
  }
}