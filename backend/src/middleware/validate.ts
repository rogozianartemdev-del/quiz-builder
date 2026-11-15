import { RequestHandler } from 'express';
import { z } from 'zod';
import { HttpError } from '../errors';

export const validateBody =
  (schema: z.ZodTypeAny): RequestHandler =>
  (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new HttpError(400, 'Validation failed', result.error.flatten()));
    }
    req.body = result.data;
    next();
  };