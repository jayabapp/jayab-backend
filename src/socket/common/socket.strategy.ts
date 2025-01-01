import { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import TokenPayload from 'src/auth/common/interface/token-payload.interface';

export async function verifySocketToken(socket: Socket): Promise<TokenPayload> {
  try {
    // get the token. without "Bearer"
    const token = socket?.handshake?.headers?.authorization || socket?.handshake?.auth?.token;
    if (!token) return;

    // verify token
    const secret = process.env.SOCKET_SECRET;
    const payload: any = verify(token, secret);
    
    return payload;
  } catch (error) {
    console.log(`\n--------------------- SOCKET ---------------------`);
    console.log('❌ UNAUTHORIZED SOCKET TOKEN');
    socket.disconnect();
    console.log(error);
    return;
  }
}
