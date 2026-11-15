import cors from 'cors';
import express, { Express } from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { createAuthMiddleware } from './middleware/auth';
import { createAuthRouter } from './routes/auth';
import { createQuizRouter } from './routes/quizzes';
import { AuthService } from './services/authService';
import { QuizService } from './services/quizService';
import { TokenService } from './services/tokenService';

export interface AppDeps {
  corsOrigin: string;
  authService: AuthService;
  quizService: QuizService;
  tokenService: TokenService;
}

export function createApp(deps: AppDeps): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: deps.corsOrigin }));
  app.use(express.json({ limit: '100kb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', createAuthRouter(deps.authService));
  app.use('/quizzes', createAuthMiddleware(deps.tokenService), createQuizRouter(deps.quizService));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}