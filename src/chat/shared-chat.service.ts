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
import { BlockParticipantUserDto } from './roles/user/dto/blacklist.dto';

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
  async findOrCreate(userId: number, dto: CreateChatUserDto): Promise<string> {
    const part = await this.db.messengerParticipant.findFirst({
      where: { user_id: userId, chatroom: { property_id: dto?.property_id } },
      select: { chatroom: { select: { uuid: true } } },
    });
    if (part) return part.chatroom.uuid;

    const property = await this.db.property.findFirst({
      where: { id: dto.property_id },
      select: { owner: { select: { user: { select: { id: true } } } } },
    });

    if (!property) throw new BadRequestException('CHAT5');

    const ownerUserId = property.owner.user.id;
    if (ownerUserId === userId) throw new BadRequestException('CHAT7');

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
              {
                user_id: ownerUserId,
                role: UserRole.OWNER,
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
   * لیست روم ها به علاوه تعداد خوانده نشده
   * @param userId
   * @returns
   */
  async findAll(userId: number): Promise<any> {
    const list = await this.db.$queryRaw<any[]>`
    SELECT 
      mc.id,
      mc.uuid,
      mc.property_id,
      p.title AS property_title,
      ROW_TO_JSON(att.*) as property_image,
      (
      SELECT COUNT(*)
      FROM messenger_messages mm
      JOIN messenger_participants mp2 ON mm.chatroom_id = mp2.chatroom_id
      WHERE mm.chatroom_id = mc.id
      AND mp2.user_id = ${userId}
      AND mm.participant_id != mp2.id
      AND mm.created_at > mp2.message_read_at
      ) AS unread_count
    FROM 
      messenger_participants mp
    JOIN 
      messenger_chatrooms mc ON mp.chatroom_id = mc.id
    JOIN 
      properties p ON mc.property_id = p.id
    LEFT JOIN 
      attachments att ON p.feature_image_id = att.id
    WHERE 
      mp.user_id = ${userId}
    `;

    return list;
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

  /**
   * create or delete blacklist according to action
   * @param dto
   * @param userId
   * @returns
   */
  async blacklist(dto: BlockParticipantUserDto, userId: number): Promise<void> {
    if (dto.target_user_id === userId) throw new BadRequestException('COMMON4');

    if (dto.action === 1)
      await this.db.messengerBlackList.upsert({
        where: { blocked_id_blocker_id: { blocked_id: dto.target_user_id, blocker_id: userId } },
        create: {
          blocked_id: dto.target_user_id,
          blocker_id: userId,
        },
        update: {},
      });
    else if (dto.action === 0) {
      const prev = await this.db.messengerBlackList.findUnique({
        where: { blocked_id_blocker_id: { blocked_id: dto.target_user_id, blocker_id: userId } },
      });
      if (!prev) throw new BadRequestException('CHAT6');

      await this.db.messengerBlackList.delete({ where: { id: prev.id } });
    }

    return;
  }

  /**
   * بررسی اینکه آیا یک کاربر توسط کاربر دیگر بلاک شده است یا خیر
   * @param blockedId
   * @param blockerId
   * @returns
   */
  async checkIsBlocked(blockedId: number, blockerId: number): Promise<boolean> {
    const isBlocked = await this.db.messengerBlackList.findFirst({
      where: { blocked_id: blockedId, blocker_id: blockerId },
    });

    return !!isBlocked;
  }
}
