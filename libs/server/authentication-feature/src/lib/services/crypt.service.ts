import { Injectable } from '@nestjs/common';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class CryptService {
  hashPassword(password: string) {
    const salt = randomBytes(256).toString('base64');
    const hash = createHash('sha512')
      .update(password)
      .update(salt)
      .digest('base64');

    return { hash, salt };
  }

  verifyPassword(options: { password: string; hash: string; salt: string }) {
    const hashVerify = createHash('sha512')
      .update(options.password)
      .update(options.salt)
      .digest('base64');

    return hashVerify === options.hash;
  }
}
