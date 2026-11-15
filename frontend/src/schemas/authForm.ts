import { z } from 'zod';

export const authFormSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  password: z.string().min(8, 'At least 8 characters').max(72),
});

export type AuthFormValues = z.infer<typeof authFormSchema>;