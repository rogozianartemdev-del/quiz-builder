import { loadConfig } from '../src/config';

describe('loadConfig', () => {
  it('throws without JWT_SECRET', () => {
    expect(() => loadConfig({})).toThrow('JWT_SECRET is required');
  });

  it('applies defaults', () => {
    expect(loadConfig({ JWT_SECRET: 's' })).toEqual({
      port: 4000,
      jwtSecret: 's',
      jwtExpiresIn: '1h',
      corsOrigin: 'http://localhost:5173',
    });
  });

  it('reads overrides', () => {
    const config = loadConfig({
      JWT_SECRET: 's',
      PORT: '5000',
      JWT_EXPIRES_IN: '2d',
      CORS_ORIGIN: 'https://example.com',
    });
    expect(config).toMatchObject({ port: 5000, jwtExpiresIn: '2d', corsOrigin: 'https://example.com' });
  });
});