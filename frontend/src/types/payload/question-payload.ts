

export type QuestionPayload =
  | { type: 'BOOLEAN'; text: string; correctBoolean: boolean }
  | { type: 'INPUT'; text: string; correctText?: string }
  | { type: 'CHECKBOX'; text: string; options: { text: string; isCorrect: boolean }[] };
