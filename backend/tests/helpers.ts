import { randomUUID } from 'crypto';
import { Express } from 'express';
import request from 'supertest';
import { createApp } from '../src/app';
import { QuizRepository } from '../src/repositories/quizRepository';
import { UserRepository } from '../src/repositories/userRepository';
import { CreateQuizInput } from '../src/schemas/quiz';
import { AuthService } from '../src/services/authService';
import { QuizService } from '../src/services/quizService';
import { TokenService } from '../src/services/tokenService';
import { User } from '../src/types/user.type';
import { Quiz } from '../src/types/quiz.type';
import { QuizSummary } from '../src/types/quiz-summary.type';

export class InMemoryUserRepository implements UserRepository {
  users: User[] = [];

  async findByEmail(email: string) {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async create(data: { email: string; passwordHash: string }) {
    const user: User = { id: randomUUID(), createdAt: new Date(), ...data };
    this.users.push(user);
    return user;
  }
}

export class InMemoryQuizRepository implements QuizRepository {
  quizzes: Quiz[] = [];

  async create(authorId: string, input: CreateQuizInput) {
    const quiz: Quiz = {
      id: randomUUID(),
      title: input.title,
      authorId,
      createdAt: new Date(),
      questions: input.questions.map((q) => ({
        id: randomUUID(),
        type: q.type,
        text: q.text,
        correctBoolean: q.type === 'BOOLEAN' ? q.correctBoolean : null,
        correctText: q.type === 'INPUT' ? (q.correctText ?? null) : null,
        options: q.type === 'CHECKBOX' ? q.options.map((o) => ({ id: randomUUID(), ...o })) : [],
      })),
    };
    this.quizzes.push(quiz);
    return quiz;
  }

  async findAll(): Promise<QuizSummary[]> {
    return this.quizzes.map(({ questions, ...rest }) => ({
      ...rest,
      questionsCount: questions.length,
    }));
  }

  async findById(id: string) {
    return this.quizzes.find((q) => q.id === id) ?? null;
  }

  async delete(id: string) {
    this.quizzes = this.quizzes.filter((q) => q.id !== id);
  }
}

export function buildTestApp() {
  const users = new InMemoryUserRepository();
  const quizzes = new InMemoryQuizRepository();
  const tokenService = new TokenService('test-secret', '1h');
  const authService = new AuthService(users, tokenService);
  const quizService = new QuizService(quizzes);
  const app = createApp({
    corsOrigin: 'http://localhost:5173',
    authService,
    quizService,
    tokenService,
  });
  return { app, users, quizzes, tokenService, authService, quizService };
}

export async function registerUser(app: Express, email = 'user@example.com') {
  const res = await request(app).post('/auth/register').send({ email, password: 'password123' });
  return { token: res.body.token as string, userId: res.body.user.id as string };
}