import request from 'supertest';
import { buildTestApp, registerUser } from './helpers';
import { TokenService } from '../src/services/tokenService';
const booleanQ = { type: 'BOOLEAN', text: 'Is the sky blue?', correctBoolean: true };
const inputQ = { type: 'INPUT', text: 'Capital of France?', correctText: 'Paris' };
const checkboxQ = {
  type: 'CHECKBOX',
  text: 'Pick the primes',
  options: [
    { text: '2', isCorrect: true },
    { text: '3', isCorrect: true },
    { text: '4', isCorrect: false },
  ],
};
const validQuiz = { title: 'My quiz', questions: [booleanQ, inputQ, checkboxQ] };

describe('quizzes', () => {
  describe('authentication', () => {
    it.each([
      ['no header', undefined],
      ['wrong scheme', 'Basic abc'],
      ['garbage token', 'Bearer garbage'],
    ])('returns 401 for %s', async (_name, header) => {
      const { app } = buildTestApp();
      const req = request(app).get('/quizzes');
      if (header) req.set('Authorization', header);
      expect((await req).status).toBe(401);
    });

    it('returns 401 for an expired token', async () => {
      const { app } = buildTestApp();
      const expired = new TokenService('test-secret', '-10s').sign('user-id');
      const res = await request(app).get('/quizzes').set('Authorization', `Bearer ${expired}`);
      expect(res.status).toBe(401);
    });
  });

  describe('POST /quizzes', () => {
    it('creates a quiz with all question types', async () => {
      const { app } = buildTestApp();
      const { token, userId } = await registerUser(app);

      const res = await request(app)
        .post('/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send(validQuiz);

      expect(res.status).toBe(201);
      expect(res.body.authorId).toBe(userId);
      expect(res.body.questions).toHaveLength(3);
      expect(res.body.questions[0]).toMatchObject({ type: 'BOOLEAN', correctBoolean: true });
      expect(res.body.questions[1]).toMatchObject({ type: 'INPUT', correctText: 'Paris' });
      expect(res.body.questions[2].options).toHaveLength(3);
    });

    it('accepts an input question without a correct answer', async () => {
      const { app } = buildTestApp();
      const { token } = await registerUser(app);
      const res = await request(app)
        .post('/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Q', questions: [{ type: 'INPUT', text: 'Your name?' }] });

      expect(res.status).toBe(201);
      expect(res.body.questions[0].correctText).toBeNull();
    });

    it.each([
      ['empty title', { ...validQuiz, title: '  ' }],
      ['no questions', { title: 'Q', questions: [] }],
      ['unknown type', { title: 'Q', questions: [{ type: 'RADIO', text: 'x' }] }],
      ['boolean without answer', { title: 'Q', questions: [{ type: 'BOOLEAN', text: 'x' }] }],
      [
        'checkbox without correct option',
        {
          title: 'Q',
          questions: [
            {
              type: 'CHECKBOX',
              text: 'x',
              options: [
                { text: 'a', isCorrect: false },
                { text: 'b', isCorrect: false },
              ],
            },
          ],
        },
      ],
      [
        'checkbox with a single option',
        {
          title: 'Q',
          questions: [{ type: 'CHECKBOX', text: 'x', options: [{ text: 'a', isCorrect: true }] }],
        },
      ],
    ])('returns 400 for %s', async (_name, payload) => {
      const { app } = buildTestApp();
      const { token } = await registerUser(app);
      const res = await request(app)
        .post('/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send(payload);
      expect(res.status).toBe(400);
    });
  });

  describe('GET /quizzes', () => {
    it('returns titles and question counts', async () => {
      const { app } = buildTestApp();
      const { token } = await registerUser(app);
      await request(app).post('/quizzes').set('Authorization', `Bearer ${token}`).send(validQuiz);

      const res = await request(app).get('/quizzes').set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(1);
      expect(res.body[0]).toMatchObject({ title: 'My quiz', questionsCount: 3 });
      expect(res.body[0].questions).toBeUndefined();
    });
  });

  describe('GET /quizzes/:id', () => {
    it('returns the full quiz', async () => {
      const { app } = buildTestApp();
      const { token } = await registerUser(app);
      const created = await request(app)
        .post('/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send(validQuiz);

      const res = await request(app)
        .get(`/quizzes/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.questions).toHaveLength(3);
    });

    it('returns 404 for an unknown id', async () => {
      const { app } = buildTestApp();
      const { token } = await registerUser(app);
      const res = await request(app).get('/quizzes/nope').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /quizzes/:id', () => {
    it('deletes own quiz', async () => {
      const { app, quizzes } = buildTestApp();
      const { token } = await registerUser(app);
      const created = await request(app)
        .post('/quizzes')
        .set('Authorization', `Bearer ${token}`)
        .send(validQuiz);

      const res = await request(app)
        .delete(`/quizzes/${created.body.id}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(204);
      expect(quizzes.quizzes).toHaveLength(0);
    });

    it('returns 404 for an unknown id', async () => {
      const { app } = buildTestApp();
      const { token } = await registerUser(app);
      const res = await request(app).delete('/quizzes/nope').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(404);
    });

    it("forbids deleting someone else's quiz", async () => {
      const { app, quizzes } = buildTestApp();
      const owner = await registerUser(app, 'owner@example.com');
      const other = await registerUser(app, 'other@example.com');
      const created = await request(app)
        .post('/quizzes')
        .set('Authorization', `Bearer ${owner.token}`)
        .send(validQuiz);

      const res = await request(app)
        .delete(`/quizzes/${created.body.id}`)
        .set('Authorization', `Bearer ${other.token}`);

      expect(res.status).toBe(403);
      expect(quizzes.quizzes).toHaveLength(1);
    });
  });
});