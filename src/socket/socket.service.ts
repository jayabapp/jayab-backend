import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import Crypto from 'crypto-js';
import { Admin } from '@prisma/client';
import { first, isEmpty } from 'lodash';
import { SocketEvents } from './common/socket-event.enum';
import TokenPayload from 'src/auth/common/interface/token-payload.interface';
import { UserRole } from 'src/common/interfaces/role.enum';
// import { InjectRedis } from '@liaoliaots/nestjs-redis';
// import Redis from 'ioredis';
import { adminCacheStatusKey, userCacheStatusKey } from 'src/common/helpers/redis.helper';

export type SocketEmitEvent = {
  name: SocketEvents;
  eventData: { event_id: string; event_type: string };
  type: 'success' | 'error' | 'warn' | 'info';
  title: string;
  body: string;
};

@Injectable()
export class SocketService {
  constructor(
    private readonly db: PrismaService,
    // @InjectRedis() private readonly redis: Redis,
  ) {}
  public socket: Server;

  /**
   *
   * @param socket
   */
  async handleConnection(payload: TokenPayload, socket: Socket): Promise<void> {
    const { role, id } = payload;
    let key: string;

    console.log(`\n--------------------- SOCKET ---------------------`);
    console.log(`🚀 Client (${role}: ${id}) Connected`);
    console.log('🆔 Socket id: ', socket.id);

    /* -------------------------------------------------------------------------- */
    // check the role and connect the user
    switch (role) {
      case UserRole.ADMIN:
        socket.join(this.createRoomKey(id));

        // set the user status (online, offline)
        // key = adminCacheStatusKey(id, socket.id);
        // await this.redis.set(key, id);
        // console.log(`🔑 Redis key: ${key}, value(user id): ${id}`);
        break;

      // case UserRole.USER:
      //   socket.join(this.createRoomKey(id));

      //   set the user status (online, offline)
      //   key = userCacheStatusKey(id, socket.id);
      //   await this.redis.set(key, id);
      //   console.log(`🔑 Redis key: ${key}, value(user id): ${id}`);
      //   break;

      default:
        break;
    }

    /* ------------------------------ LOG FOR TEST ------------------------------ */
    // await this.fetchRedisDataForTest(key);

    /* -------------------------------------------------------------------------- */
    socket.emit(SocketEvents.CLIENT_CONNECTED, { socket_id: socket.id });
    socket.broadcast.emit(SocketEvents.USER_STATUS, { user_id: id, role, is_online: true });
  }

  /**
   *
   * @param socket
   */
  async handleDisconnect(socket: Socket): Promise<void> {
    // const key = first(await this.redis.keys(`*status:${socket.id}`));

    console.log('\n--------------------- SOCKET ---------------------');
    console.log('🚀 Client Disconnected');
    console.log('🆔 Socket id: ', socket.id);
    // console.log('🔑 Redis key: ', key);

    // if (key) {
    //   const userId = parseInt(key.split(':')[1]);
    //   const role = key.split(':')[0];

    //   // del all the redis keys
    //   const keys = await this.redis.keys(`${role}:${userId}:status*`);
    //   !isEmpty(keys) && (await this.redis.del(keys));

    //   socket.broadcast.emit(SocketEvents.USER_STATUS, { user_id: userId, role, is_online: false });
    // }

    socket.disconnect();

    /* ------------------------------ LOG FOR TEST ------------------------------ */
    // await this.fetchRedisDataForTest(key);
  }

  /**
   *
   * @param ids
   * @param event
   * @returns
   */
  emit(ids: number[], event: SocketEmitEvent): void {
    for (const id of ids) {
      this.socket.in(this.createRoomKey(id)).emit(event.name, event);
    }

    return;
  }

  /**
   * emit to panel admin
   * @param alert
   * @returns
   */
  async emitToAdmins(alert: {
    event?: string;
    eventData?: number;
    id: number;
    type: 'success' | 'error' | 'warn' | 'info';
    title: string;
    body: string;
    route?: string;
  }): Promise<void> {
    return;
  }

  /**
   *
   * @param connectedSocket
   * @param data
   */
  handleEvent(connectedSocket: Socket, data): void {
    switch (data?.event) {
      case 'adminHandshake':
        connectedSocket.join(this.createRoomKey(data.adminId));
        break;

      default:
        break;
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  createRoomKey(id: number): string {
    const roomKey = Crypto.SHA1(`${id}::+jdkUDu7sff@7OOk`).toString();
    return roomKey;
  }

  async fetchRedisDataForTest(key: string): Promise<void> {
    // const data = await this.redis.get(key);
    // console.log(`${data ? '✅' : '❌'} The socket id fetched from the redis`);
  }
}
