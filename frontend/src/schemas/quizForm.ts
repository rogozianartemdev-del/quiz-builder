import { z } from 'zod';
import type { CreateQuizPayload } from '../types/payload/create-quiz-payload';

const optionSchema = z.object({ text: z.string().trim(), isCorrect: z.boolean() });

const questionSchema = z
  .object({
    type: z.enum(['BOOLEAN', 'INPUT', 'CHECKBOX']),
    text: z.string().trim().min(1, 'Question text is required'),
    correctBoolean: z.enum(['true', 'false']),
    correctText: z.string().trim(),
    options: z.array(optionSchema),
  })
  .superRefine((q, ctx) => {
    if (q.type !== 'CHECKBOX') return;
    if (q.options.length < 2) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'Add at least 2 options' });
    }
    q.options.forEach((o, i) => {
      if (!o.text) {
        ctx.addIssue({ code: 'custom', path: ['options', i, 'text'], message: 'Option text is required' });
      }
    });
    if (!q.options.some((o) => o.isCorrect)) {
      ctx.addIssue({ code: 'custom', path: ['options'], message: 'Mark at least one correct option' });
    }
  });

export const quizFormSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  questions: z.array(questionSchema).min(1, 'Add at least one question'),
});

export type QuizFormValues = z.infer<typeof quizFormSchema>;
export type QuestionFormValues = QuizFormValues['questions'][number];

export function newQuestion(): QuestionFormValues {
  return {
    type: 'BOOLEAN',
    text: '',
    correctBoolean: 'true',
    correctText: '',
    options: [
      { text: '', isCorrect: false },
      { text: '', isCorrect: false },
    ],
  };
}

export function toPayload(values: QuizFormValues): CreateQuizPayload {
  return {
    title: values.title,
    questions: values.questions.map((q) => {
      switch (q.type) {
        case 'BOOLEAN':
          return { type: 'BOOLEAN', text: q.text, correctBoolean: q.correctBoolean === 'true' };
        case 'INPUT':
          return { type: 'INPUT', text: q.text, correctText: q.correctText || undefined };
        case 'CHECKBOX':
          return { type: 'CHECKBOX', text: q.text, options: q.options };
      }
    }),
  };
}