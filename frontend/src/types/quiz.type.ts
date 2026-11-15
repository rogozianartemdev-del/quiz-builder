import type { Question } from "./question.type";


export interface Quiz {
  id: string;
  title: string;
  authorId: string;
  questions: Question[];
}