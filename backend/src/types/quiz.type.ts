import { Question } from "./question.type";

export interface Quiz {
  id: string;
  title: string;
  authorId: string;
  createdAt: Date;
  questions: Question[];
}