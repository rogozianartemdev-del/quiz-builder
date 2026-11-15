import { PrismaClient } from '@prisma/client';
import { User } from '../types/user.type';

export interface UserRepository {
  findByEmail(email: string): Promise<User | null>;
  create(data: { email: string; passwordHash: string }): Promise<User>;
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly prisma: PrismaClient) {}

  findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: { email: string; passwordHash: string }): Promise<User> {
    return this.prisma.user.create({ data });
  }
}