export interface Config {
  port: number;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET is required');
  }
  return {
    port: Number(env.PORT ?? 4000),
    jwtSecret: env.JWT_SECRET,
    jwtExpiresIn: env.JWT_EXPIRES_IN ?? '1h',
    corsOrigin: env.CORS_ORIGIN ?? 'http://localhost:5173',
  };
}