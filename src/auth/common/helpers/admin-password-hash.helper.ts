import Crypto from 'crypto-js';

/**
 * Hash password with nonce for ten times
 * @param password
 * @returns
 */
export function hashPassword(password: string): string {
  const nonce = process.env.ADMIN_PASS_NONCE;
  let hashedPassword: string = Crypto.SHA1(password + nonce).toString();
  for (let i = 0; i < 10; i++) {
    hashedPassword = Crypto.SHA1(hashedPassword).toString();
  }
  return hashedPassword;
}
