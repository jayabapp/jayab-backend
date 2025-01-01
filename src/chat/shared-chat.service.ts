import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import { Attachment, MessengerMessages, Prisma } from '@prisma/client';
import { SendMessageDto } from './common/dto/send-message.dto';
import { CursorPaginatedResult, cursorPaginate } from 'src/common/helpers/cursor-paginator';
import { CreateChatUserDto } from './roles/user/dto/create.dto';
import { UserRole } from 'src/common/interfaces/role.enum';
import moment from 'moment-jalaali';
import { PartialParticipant } from './common/chat.interface';
import { v7 as uuid } from 'uuid';

@Injectable()
export class SharedChatService {
  constructor(
    private readonly db: PrismaService,
    private readonly fcmService: FirebaseService,
  ) {}

  /**
   *
   * @param userId
   * @param dto
   * @returns
   */
  async create(userId: number, dto: CreateChatUserDto): Promise<string> {
    const newRoom = await this.db.messengerChatroom.create({
      data: {
        property_id: dto?.property_id,
        uuid: uuid(),
        participants: {
          createMany: {
            data: [
              {
                user_id: userId,
                role: UserRole.USER,
                message_read_at: new Date(),
              },
            ],
          },
        },
      },
    });

    return newRoom.uuid;
  }

  /**
   *
   * @param chatroomId
   * @param senderId
   * @param dto
   * @returns
   */
  async sendMessage(
    chatroomId: number,
    senderId: number,
    dto: SendMessageDto,
  ): Promise<MessengerMessages & { media: Attachment }> {
    /* -------------------------------------------------------------------------- */
    // create new message
    const message = await this.db.messengerMessages.create({
      data: { ...dto, chatroom_id: chatroomId, participant_id: senderId },
      include: { media: true },
    });

    return message;
  }

  /**
   * Find one chatroom messages
   *
   * @param {number} chatroomId
   * @returns
   */
  async findMessages(chatroomId: number, cursor: number): Promise<CursorPaginatedResult<MessengerMessages>> {
    const result = await cursorPaginate()<MessengerMessages, Prisma.MessengerMessagesFindManyArgs>(
      this.db.messengerMessages,
      {
        where: { chatroom_id: chatroomId },
        include: { media: true },
      },
      { cursor, perPage: 20 },
    );

    // await this.db.messengerParticipant.update({
    //   where: { chatroom_id_user_id: { user_id: userId, chatroom_id: chatroomId } },
    //   data: { message_read_at: new Date() },
    // });

    return result;
  }

  async sendNotification(fcmToken: string, newMessage: MessengerMessages, type: string): Promise<void> {
    try {
      const body =
        newMessage.text?.length > 150
          ? `💬 ${newMessage.text?.substring(0, 150)}  ...`
          : `💬 ${newMessage.text}`;

      if (fcmToken)
        await this.fcmService.sendNotification([fcmToken], {
          notification: { title: 'New message', body },
          data: { type, new_message: JSON.stringify(newMessage) },
        });
    } catch (error) {
      console.log(error);
    }
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   *
   * @param userId
   * @param dto
   * @returns
   */
  async canCreateChat(userId: number, dto: CreateChatUserDto): Promise<boolean> {
    //limitation logic
    if (false) throw new BadRequestException('CHAT3');

    return true;
  }

  async deleteMessage(chatroomId: number, participantId: number, messageId: number): Promise<void> {
    const message = await this.db.messengerMessages.findFirst({
      where: { chatroom_id: chatroomId, participant_id: participantId, id: messageId },
    });

    if (!message) throw new BadRequestException('CHAT4');
    if (moment(message.created_at).diff(moment(), 'm') >= 1) throw new BadRequestException('CHAT4');

    await this.db.messengerMessages.update({ where: { id: messageId }, data: { deleted_at: new Date() } });
  }

  /**
   * unread message count
   * @param chatroomId
   * @param participantId
   */
  async unreadCountInChatroom(chatroomId: number, self: PartialParticipant): Promise<number> {
    const count = await this.db.messengerMessages.count({
      where: { chatroom_id: chatroomId, created_at: { gt: self.message_read_at } },
    });

    return count;
  }

  /**
   * get unread count from view table
   * @param userId
   * @param role
   * @returns
   */
  async unreadCount(userId: number): Promise<number> {
    const item = await this.db.unreadMessageCount.findFirst({
      where: { user_id: userId },
    });

    return item?.unread_count || 0;
  }

  async unreadMessages(userId: number): Promise<any[]> {
    const list = await this.db.$queryRaw<any[]>`
    SELECT 
    mm.id AS message_id,
    mm.text,
    mm.third_party,
    mm.chatroom_id,
    mm.created_at,
    mc.deposit_id,
    mc.withdraw_id,
    mp.id as p_id,
    ROW_TO_JSON(a.*) as media
      FROM 
        messenger_messages mm
      JOIN 
        messenger_participants mp 
          ON mm.chatroom_id = mp.chatroom_id 
          AND mp.user_id = ${userId}                       
      JOIN 
        messenger_chatrooms mc ON mm.chatroom_id = mc.id   
      LEFT JOIN 
        attachments a 
          ON mm.media_id = a.id                          
      WHERE 
        mm.created_at > mp.message_read_at
    `;

    return list;
  }

  /**
  "token": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMwMDEzNjQ3LCJleHAiOjE3MzA2MTg0NDd9.sTVKPateqw3CCknA2XWIcGVYpMhEc5idQcBpw559tjU",
      "socket_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzMwMDEzNjQ3LCJleHAiOjE3MzI2MDU2NDd9.I8EipV28OfXaG09D1x4IqqW9LnZIt9lx_lB6EXxEmnQ"
    }
  */
  /**
   * update last read at
   * @param participantId
   * @returns
   */
  async updateReadAt(participantId: number): Promise<void> {
    await this.db.messengerParticipant.update({
      where: { id: participantId },
      data: { message_read_at: new Date() },
    });

    return;
  }
}
