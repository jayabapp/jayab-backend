import {
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  MessageBody,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { SocketService } from './socket.service';
import { verifySocketToken } from './common/socket.strategy';

@WebSocketGateway()
export class SocketGateway implements OnGatewayConnection {
  @WebSocketServer()
  private server: Socket;
  constructor(private readonly socketService: SocketService) {}

  afterInit(server: Server): void {
    this.socketService.socket = server;
    return;
  }

  async handleConnection(socket: Socket): Promise<void> {
    /* -------------------------------------------------------------------------- */
    // verify the token
    const payload = await verifySocketToken(socket);
    if (!payload) {
      socket.disconnect();
      return;
    }

    //
    this.socketService.handleConnection(payload, socket);
  }

  async handleDisconnect(socket: Socket): Promise<void> {
    await this.socketService.handleDisconnect(socket);
  }

  @SubscribeMessage('events')
  handleEvent(@ConnectedSocket() socket: Socket, @MessageBody() data: string): void {
    this.socketService.handleEvent(socket, data);
  }
}
