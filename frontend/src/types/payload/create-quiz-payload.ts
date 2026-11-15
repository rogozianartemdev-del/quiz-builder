import type { QuestionPayload } from "./question-payload";



export interface CreateQuizPayload {
  title: string;
  questions: QuestionPayload[];
}