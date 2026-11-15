import { HttpError } from '../errors';
import { QuizRepository } from '../repositories/quizRepository';
import { CreateQuizInput } from '../schemas/quiz';
import { QuizSummary } from '../types/quiz-summary.type';
import { Quiz } from '../types/quiz.type';

export class QuizService {
  constructor(private readonly quizzes: QuizRepository) {}

  create(userId: string, input: CreateQuizInput): Promise<Quiz> {
    return this.quizzes.create(userId, input);
  }

  list(): Promise<QuizSummary[]> {
    return this.quizzes.findAll();
  }

  async get(id: string): Promise<Quiz> {
    const quiz = await this.quizzes.findById(id);
    if (!quiz) throw new HttpError(404, 'Quiz not found');
    return quiz;
  }

  async remove(id: string, userId: string): Promise<void> {
    const quiz = await this.get(id);
    if (quiz.authorId !== userId) {
      throw new HttpError(403, 'You can delete only your own quizzes');
    }
    await this.quizzes.delete(id);
  }
}