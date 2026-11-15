import { z } from 'zod';

const text = z.string().trim().min(1).max(500);

const booleanQuestion = z.object({
  type: z.literal('BOOLEAN'),
  text,
  correctBoolean: z.boolean(),
});

const inputQuestion = z.object({
  type: z.literal('INPUT'),
  text,
  correctText: z.string().trim().max(255).optional(),
});

const checkboxQuestion = z.object({
  type: z.literal('CHECKBOX'),
  text,
  options: z
    .array(z.object({ text: z.string().trim().min(1).max(255), isCorrect: z.boolean() }))
    .min(2)
    .max(10)
    .refine((options) => options.some((o) => o.isCorrect), {
      message: 'At least one option must be correct',
    }),
});

export const questionSchema = z.discriminatedUnion('type', [
  booleanQuestion,
  inputQuestion,
  checkboxQuestion,
]);

export const createQuizSchema = z.object({
  title: z.string().trim().min(1).max(200),
  questions: z.array(questionSchema).min(1).max(50),
});

export type CreateQuizInput = z.infer<typeof createQuizSchema>;