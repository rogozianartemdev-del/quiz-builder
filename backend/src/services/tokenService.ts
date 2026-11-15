import jwt, { SignOptions } from 'jsonwebtoken';

export class TokenService {
  constructor(
    private readonly secret: string,
    private readonly expiresIn: string,
  ) {}

  sign(userId: string): string {
    return jwt.sign({}, this.secret, {
      subject: userId,
      algorithm: 'HS256',
      expiresIn: this.expiresIn as SignOptions['expiresIn'],
    });
  }

  verify(token: string): string {
    const payload = jwt.verify(token, this.secret, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || !payload.sub) {
      throw new Error('Invalid token payload');
    }
    return payload.sub;
  }
}