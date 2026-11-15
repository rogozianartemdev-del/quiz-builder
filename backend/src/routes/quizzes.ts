import { Router } from 'express';
import { requireUserId } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { createQuizSchema } from '../schemas/quiz';
import { QuizService } from '../services/quizService';

export function createQuizRouter(quizzes: QuizService): Router {
  const router = Router();

  router.post('/', validateBody(createQuizSchema), async (req, res) => {
    res.status(201).json(await quizzes.create(requireUserId(req), req.body));
  });

  router.get('/', async (_req, res) => {
    res.json(await quizzes.list());
  });

  router.get('/:id', async (req, res) => {
    res.json(await quizzes.get(req.params.id));
  });

  router.delete('/:id', async (req, res) => {
    await quizzes.remove(req.params.id, requireUserId(req));
    res.status(204).send();
  });

  return router;
}