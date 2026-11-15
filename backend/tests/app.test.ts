import request from 'supertest';
import { buildTestApp, registerUser } from './helpers';

describe('app', () => {
  afterEach(() => jest.restoreAllMocks());

  it('responds to /health', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns 404 for unknown routes', async () => {
    const { app } = buildTestApp();
    const res = await request(app).get('/nope');
    expect(res.status).toBe(404);
  });

  it('returns 400 for malformed JSON', async () => {
    const { app } = buildTestApp();
    const res = await request(app)
      .post('/auth/login')
      .set('Content-Type', 'application/json')
      .send('{"email":');
    expect(res.status).toBe(400);
    expect(res.body.message).toBe('Invalid JSON body');
  });

  it('maps unique constraint violations to 409', async () => {
    const { app, authService } = buildTestApp();
    jest.spyOn(authService, 'register').mockRejectedValue({ code: 'P2002' });
    const res = await request(app)
      .post('/auth/register')
      .send({ email: 'a@b.com', password: 'password123' });
    expect(res.status).toBe(409);
  });

  it('hides details of unexpected errors', async () => {
    const { app, quizService } = buildTestApp();
    const { token } = await registerUser(app);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(quizService, 'list').mockRejectedValue(new Error('db password leaked'));

    const res = await request(app).get('/quizzes').set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ message: 'Internal server error' });
  });

  it('handles non-object errors', async () => {
    const { app, quizService } = buildTestApp();
    const { token } = await registerUser(app);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    jest.spyOn(quizService, 'list').mockRejectedValue(undefined);

    const res = await request(app).get('/quizzes').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(500);
  });
});