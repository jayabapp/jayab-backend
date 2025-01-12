import { Injectable } from '@nestjs/common';
import { Socket, Server } from 'socket.io';
import { PrismaService } from 'src/prisma/prisma.service';
import Crypto from 'crypto-js';
import {
  Admin,
  Attachment,
  MessengerChatroom,
  MessengerMessages,
  MessengerParticipant,
} from '@prisma/client';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { userCacheStatusKey, adminCacheStatusKey } from 'src/common/helpers/redis.helper';
import { SocketEvents } from './common/socket-event.enum';
import { UserRole } from 'src/common/interfaces/role.enum';
import TokenPayload from 'src/auth/common/interface/token-payload.interface';
import { SocketEventChatIsTypingData } from './common/socket-data.type';
import { first, isEmpty } from 'lodash';
import { MessengerMessagesResType } from 'src/chat/serializer/messager-message.serializer';
import { PartialParticipant } from 'src/chat/common/chat.interface';

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
    @InjectRedis() private readonly redis: Redis,
  ) {}
  public socket: Server;

  /**
   *
   * @param socket
   */
  async handleConnection(payload: TokenPayload, socket: Socket): Promise<void> {
    console.log(`\n--------------------- SOCKET ---------------------`);
    console.log('🚀 Client Connected');
    console.log('🆔 Socket id: ', socket.id);

    /* -------------------------------------------------------------------------- */
    // check the role and connect the user
    const { role, id } = payload;
    let key: string;

    switch (role) {
      case UserRole.ADMIN:
        socket.join(this.createRoomKey(id, UserRole.ADMIN));

        // set the user status (online, offline)
        key = adminCacheStatusKey(id, socket.id);
        await this.redis.set(key, id);
        console.log(`🔑 Redis key: ${key}, value(user id): ${id}`);
        break;

      case UserRole.USER:
        socket.join(this.createRoomKey(id, UserRole.USER));

        // set the user status (online, offline)
        key = userCacheStatusKey(id, socket.id);
        await this.redis.set(key, id);
        console.log(`🔑 Redis key: ${key}, value(user id): ${id}`);
        break;

      default:
        break;
    }

    /* ------------------------------ LOG FOR TEST ------------------------------ */
    await this.fetchRedisDataForTest(key);

    /* -------------------------------------------------------------------------- */
    socket.emit(SocketEvents.CLIENT_CONNECTED, { socket_id: socket.id });
    socket.broadcast.emit(SocketEvents.USER_STATUS, { user_id: id, role, is_online: true });
  }

  /**
   *
   * @param socket
   */
  async handleDisconnect(socket: Socket): Promise<void> {
    const key = first(await this.redis.keys(`*status:${socket.id}`));

    console.log('\n--------------------- SOCKET ---------------------');
    console.log('🚀 Client Disconnected');
    console.log('🆔 Socket id: ', socket.id);
    console.log('🔑 Redis key: ', key);

    if (key) {
      const userId = parseInt(key.split(':')[1]);
      const role = key.split(':')[0];

      // del all the redis keys
      const keys = await this.redis.keys(`${role}:${userId}:status*`);
      !isEmpty(keys) && (await this.redis.del(keys));

      socket.broadcast.emit(SocketEvents.USER_STATUS, { user_id: userId, role, is_online: false });
    }

    socket.disconnect();

    /* ------------------------------ LOG FOR TEST ------------------------------ */
    await this.fetchRedisDataForTest(key);
  }

  /* -------------------------------------------------------------------------- */
  /*                                EMIT METHODS                                */
  /* -------------------------------------------------------------------------- */

  emit(ids: number[], event: SocketEmitEvent, role = UserRole.USER): void {
    for (const id of ids) {
      this.socket.in(this.createRoomKey(id, role)).emit(event.name, event);
    }
    return;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    CHAT                                    */
  /* -------------------------------------------------------------------------- */
  /**
   * @param alert
   * @returns
   */
  async emitNewChatMessage(
    chatroomId: string,
    recipient: PartialParticipant, // for socket key to emit
    msg: MessengerMessagesResType,
  ): Promise<void> {
    /* -------------------------------------------------------------------------- */
    console.log({ recipient });

    // create key
    const key = this.createRoomKey(recipient.user_id, UserRole.USER);

    /* -------------------------------------------------------------------------- */
    // emit
    this.socket.to(key).emit(SocketEvents.CHAT_NEW_MESSAGE, {
      chatroom_id: chatroomId,
      message: msg,
    });
  }

  /**
   * @param alert
   * @returns
   */
  async emitDeleteMessage(
    chatroomId: string,
    recipientId: number, // for socket key to emit
  ): Promise<void> {
    /* -------------------------------------------------------------------------- */
    // create key
    const key = this.createRoomKey(recipientId, UserRole.USER);

    /* -------------------------------------------------------------------------- */
    // emit
    this.socket.to(key).emit(SocketEvents.CHAT_MESSAGE_DELETED, { chatroom_id: chatroomId });
  }

  /**
   *
   * @param data
   * @returns
   */
  async emitIsTyping(data: SocketEventChatIsTypingData): Promise<void> {
    const chatroom = await this.db.messengerChatroom.findUnique({
      where: { uuid: data.chatroom_id },
      select: { participants: true },
    });
    if (!chatroom) return;

    const self = chatroom.participants.find((e) => e?.id === data.participant_id);
    const recipient = chatroom.participants.find((e) => e?.id !== data.participant_id);

    if (!self) return;

    if (recipient) {
      /* -------------------------------------------------------------------------- */
      // create key
      const key = this.createRoomKey(recipient.user_id, recipient.role as UserRole);

      /* -------------------------------------------------------------------------- */
      // emit
      this.socket
        .to(key)
        .emit(SocketEvents.CHAT_IS_TYPING, { chatroom_id: data.chatroom_id, is_typing: data.is_typing });
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  createRoomKey(id: number, role: UserRole): string {
    const roomKey = Crypto.SHA1(`${id}::${role}::jd&kUDu7sff@7OOk`).toString();
    return roomKey;
  }

  async fetchRedisDataForTest(key: string): Promise<void> {
    const data = await this.redis.get(key);
    console.log(`${data ? '✅' : '❌'} The socket id fetched from the redis`);
  }
}
