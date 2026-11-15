import { ErrorRequestHandler, RequestHandler } from 'express';
import { HttpError } from '../errors';

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, details: err.details });
    return;
  }
  const { type, code } = (err ?? {}) as { type?: string; code?: string };
  if (type === 'entity.parse.failed') {
    res.status(400).json({ message: 'Invalid JSON body' });
    return;
  }
  if (code === 'P2002') {
    res.status(409).json({ message: 'Resource already exists' });
    return;
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
};