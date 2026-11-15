import type {Option} from './option.type';


export type QuestionType = 'BOOLEAN' | 'INPUT' | 'CHECKBOX';


export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  correctBoolean: boolean | null;
  correctText: string | null;
  options: Option[];
}