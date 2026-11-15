import bcrypt from 'bcryptjs';
import { HttpError } from '../errors';
import { UserRepository } from '../repositories/userRepository';
import { Credentials } from '../schemas/auth';
import { User } from '../types/user.type';
import { TokenService } from './tokenService';

export interface AuthResult {
  token: string;
  user: { id: string; email: string };
}

export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenService,
  ) {}

  async register({ email, password }: Credentials): Promise<AuthResult> {
    if (await this.users.findByEmail(email)) {
      throw new HttpError(409, 'Email is already registered');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.users.create({ email, passwordHash });
    return this.buildResult(user);
  }

  async login({ email, password }: Credentials): Promise<AuthResult> {
    const user = await this.users.findByEmail(email);
    const valid = user !== null && (await bcrypt.compare(password, user.passwordHash));
    if (!user || !valid) {
      throw new HttpError(401, 'Invalid email or password');
    }
    return this.buildResult(user);
  }

  private buildResult(user: User): AuthResult {
    return { token: this.tokens.sign(user.id), user: { id: user.id, email: user.email } };
  }
}