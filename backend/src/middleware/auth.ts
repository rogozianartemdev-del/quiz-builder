import { Request, RequestHandler } from 'express';
import { HttpError } from '../errors';
import { TokenService } from '../services/tokenService';

declare module 'express-serve-static-core' {
  interface Request {
    userId?: string;
  }
}

export function createAuthMiddleware(tokens: TokenService): RequestHandler {
  return (req, _res, next) => {
    const [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) {
      return next(new HttpError(401, 'Authentication required'));
    }
    try {
      req.userId = tokens.verify(token);
      next();
    } catch {
      next(new HttpError(401, 'Invalid or expired token'));
    }
  };
}

export function requireUserId(req: Request): string {
  if (!req.userId) throw new HttpError(401, 'Authentication required');
  return req.userId;
}