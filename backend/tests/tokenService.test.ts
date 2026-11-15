import jwt from 'jsonwebtoken';
import { TokenService } from '../src/services/tokenService';

describe('TokenService', () => {
  const service = new TokenService('secret', '1h');

  it('signs and verifies a token', () => {
    expect(service.verify(service.sign('user-1'))).toBe('user-1');
  });

  it('rejects a token signed with another secret', () => {
    const forged = new TokenService('other', '1h').sign('user-1');
    expect(() => service.verify(forged)).toThrow();
  });

  it('rejects a token without a subject', () => {
    const token = jwt.sign({}, 'secret');
    expect(() => service.verify(token)).toThrow('Invalid token payload');
  });
});