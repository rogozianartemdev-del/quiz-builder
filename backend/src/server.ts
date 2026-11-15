import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { createApp } from './app';
import { loadConfig } from './config';
import { PrismaQuizRepository } from './repositories/quizRepository';
import { PrismaUserRepository } from './repositories/userRepository';
import { AuthService } from './services/authService';
import { QuizService } from './services/quizService';
import { TokenService } from './services/tokenService';

const config = loadConfig();
const prisma = new PrismaClient();
const tokenService = new TokenService(config.jwtSecret, config.jwtExpiresIn);

const app = createApp({
  corsOrigin: config.corsOrigin,
  tokenService,
  authService: new AuthService(new PrismaUserRepository(prisma), tokenService),
  quizService: new QuizService(new PrismaQuizRepository(prisma)),
});

const server = app.listen(config.port, () => {
  console.log(`API listening on :${config.port}`);
});

const shutdown = () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);