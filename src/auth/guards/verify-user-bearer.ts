import { verify } from 'jsonwebtoken';
import TokenPayload from '../common/interface/token-payload.interface';

export async function verifyUserTokenManualy(token: string): Promise<TokenPayload> {
  try {
    if (!token) return;
    // verify token
    const secret = process.env.USER_SECRET;
    const payload: any = verify(token, secret);

    return payload;
  } catch (error) {
    console.log('❌ INVALID USER TOKEN');
    return;
  }
}
