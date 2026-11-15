import { Router } from 'express';
import { validateBody } from '../middleware/validate';
import { credentialsSchema } from '../schemas/auth';
import { AuthService } from '../services/authService';

export function createAuthRouter(auth: AuthService): Router {
  const router = Router();

  router.post('/register', validateBody(credentialsSchema), async (req, res) => {
    res.status(201).json(await auth.register(req.body));
  });

  router.post('/login', validateBody(credentialsSchema), async (req, res) => {
    res.json(await auth.login(req.body));
  });

  return router;
}