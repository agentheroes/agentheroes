import { sign, verify } from 'jsonwebtoken';
import { hashSync, compareSync } from 'bcrypt';
import crypto from 'crypto';

export class EncryptionService {
  static hashPassword(password: string) {
    return hashSync(password, 10);
  }
  static comparePassword(password: string, hash: string) {
    return compareSync(password, hash);
  }
  static signJWT(value: object) {
    return sign(value, process.env.AUTH_SECRET!);
  }
  static verifyJWT(token: string) {
    return verify(token, process.env.AUTH_SECRET!);
  }
}
