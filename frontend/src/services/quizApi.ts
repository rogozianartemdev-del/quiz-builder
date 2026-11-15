    
import type { QuizSummary } from '../types/quiz-summery';
import type { Quiz } from '../types/quiz.type';
import type { CreateQuizPayload } from '../types/payload/create-quiz-payload';
import { request } from './http';

export const quizApi = {
  list: () => request<QuizSummary[]>('/quizzes'),
  get: (id: string) => request<Quiz>(`/quizzes/${id}`),
  create: (payload: CreateQuizPayload) =>
    request<Quiz>('/quizzes', { method: 'POST', body: JSON.stringify(payload) }),
  remove: (id: string) => request<void>(`/quizzes/${id}`, { method: 'DELETE' }),
};