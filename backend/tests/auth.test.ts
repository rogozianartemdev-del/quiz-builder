import request from 'supertest';
import { buildTestApp } from './helpers';

describe('auth', () => {
  const creds = { email: 'User@Example.com', password: 'password123' };

  it('registers a user and returns a token without the password hash', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/auth/register').send(creds);

    expect(res.status).toBe(201);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user.email).toBe('user@example.com');
    expect(JSON.stringify(res.body)).not.toContain('passwordHash');
  });

  it('rejects duplicate registration', async () => {
    const { app } = buildTestApp();
    await request(app).post('/auth/register').send(creds);
    const res = await request(app).post('/auth/register').send(creds);
    expect(res.status).toBe(409);
  });

  it.each([
    [{ email: 'not-an-email', password: 'password123' }],
    [{ email: 'a@b.com', password: 'short' }],
    [{}],
  ])('rejects invalid payload %j', async (payload) => {
    const { app } = buildTestApp();
    const res = await request(app).post('/auth/register').send(payload);
    expect(res.status).toBe(400);
  });

  it('logs in with correct credentials', async () => {
    const { app } = buildTestApp();
    await request(app).post('/auth/register').send(creds);
    const res = await request(app).post('/auth/login').send(creds);

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
  });

  it('rejects a wrong password', async () => {
    const { app } = buildTestApp();
    await request(app).post('/auth/register').send(creds);
    const res = await request(app)
      .post('/auth/login')
      .send({ ...creds, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('rejects an unknown email', async () => {
    const { app } = buildTestApp();
    const res = await request(app).post('/auth/login').send(creds);
    expect(res.status).toBe(401);
  });
});