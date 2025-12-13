import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { FindOneChatInterceptor } from 'src/chat/common/chat.interceptor';
import { PartialChatroom } from 'src/chat/common/chat.interface';
import { FindAllChatMessagesDto } from 'src/chat/common/dto/find-all-chat-messages.dto';
import { SendMessageDto } from 'src/chat/common/dto/send-message.dto';
import { ROUTE_GROUP } from 'src/chat/common/route-group.constant';
import { SharedChatService } from 'src/chat/shared-chat.service';
import { SuccessResponseArgs } from 'src/common/interceptors/transform.interceptor';
import { RequestType } from 'src/common/interfaces/user.interface';
import { CreateChatUserDto } from './dto/create.dto';
import { SocketService } from 'src/socket/socket.service';
import { UserRole } from 'src/common/interfaces/role.enum';
import { AttachmentService } from 'src/attachment/attachment.service';
import { CHAT_MEDIA_FOLDER } from 'src/common/utils/constants/storage-folders';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { first } from 'lodash';
import { MessengerMessagesSerializer } from 'src/chat/serializer/messager-message.serializer';
import { UserJwtGuard } from 'src/auth/guards/jwt/user-jwt.guard';
import { BlockParticipantUserDto } from './dto/blacklist.dto';
import { PropertyUserService } from 'src/property/roles/user/user.service';
import { FirebaseService } from 'src/firebase/firebase.service';
import createTopicKey from 'src/firebase/common/topic-generator.helper';

@ApiTags('Chat')
@UseGuards(UserJwtGuard)
@ApiBearerAuth('user-jwt')
@Controller(ROUTE_GROUP)
export class ChatUserController {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly sharedChatService: SharedChatService,
    private readonly socketService: SocketService,
    private readonly attachmentService: AttachmentService,
    private readonly propertyService: PropertyUserService,
    private readonly fcmService: FirebaseService,
  ) {}

  @ApiOperation({ summary: 'Find All' })
  @Get()
  async findAll(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;

    const result = await this.sharedChatService.findAll(user.id);

    /* -------------------------------------------------------------------------- */
    return { result };
  }

  /**
   * هر درخواست یک چتروم دارد
   * چت همیشه از سمت کاربر ایجاد میشود
   */
  @ApiOperation({ summary: 'Create Or Find Chatroom' })
  @Post()
  async findOrCreate(
    @Req() request: RequestType,
    @Body() dto: CreateChatUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;

    /* -------------------------------------------------------------------------- */
    // checking if user can start chat.
    await this.sharedChatService.canCreateChat(user.id, dto);

    /* -------------------------------------------------------------------------- */
    // create chatroom
    const chatroomId = await this.sharedChatService.findOrCreate(user.id, dto);

    /* -------------------------------------------------------------------------- */
    return { result: { chatroom_id: chatroomId } };
  }

  @ApiOperation({ summary: 'Send message' })
  @UseInterceptors(FindOneChatInterceptor)
  @Post(':chatroomId/send-message')
  async sendMessage(
    @Req() request: RequestType,
    @Param('chatroomId') chatroomId: string,
    @Body() dto: SendMessageDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;

    /* -------------------------------------------------------------------------- */
    if (!dto.media_id && !dto.text) throw new BadRequestException('CHAT2');

    /* -------------------------------------------------------------------------- */
    // check and get the chatroom and participants from interceptor
    const chatroom: PartialChatroom = request.interceptor_data;

    const isBlocked = await this.sharedChatService.checkIsBlocked(
      chatroom.participants.self.user_id, //من که بلاک شدم
      chatroom.participants.recipient.user_id, //طرف مثابل که من رو بلاک کرده
    );
    if (isBlocked) throw new BadRequestException('CHAT9');

    /* -------------------------------------------------------------------------- */
    // create message
    const msg = await this.sharedChatService.sendMessage(
      chatroom.id,
      chatroom.participants.self.participant_id,
      dto,
    );

    /* -------------------------------------------------------------------------- */
    // emit the new message to the recipient if it's exists
    if (chatroom?.participants?.recipient) {
      const m = MessengerMessagesSerializer.summarize(msg);
      //socket
      await this.socketService.emitNewChatMessage(chatroom.uuid, chatroom.participants.recipient, m);

      //notif
      this.fcmService.sendNotificationToTopic(
        createTopicKey(chatroom.participants.recipient.user_id, UserRole.USER),
        {
          notification: {
            title: '✉️ پیام جدید',
            body: m.text,
            // clickAction: `http://localhost:33037/chat/${chatroomId}`,
          },
        },
        null,
        { chatroomId },
      );
    }

    /* -------------------------------------------------------------------------- */
    return {
      result: {
        chatroom_id: chatroom.uuid,
        message: MessengerMessagesSerializer.summarize(msg),
      },
    };
  }

  @ApiOperation({ summary: 'Find one' })
  @UseInterceptors(FindOneChatInterceptor)
  @Get(':chatroomId')
  async findOne(
    @Req() request: RequestType,
    @Param('chatroomId') chatroomId: string,
  ): Promise<SuccessResponseArgs> {
    const chatroom: PartialChatroom = request.interceptor_data;

    const recipient = chatroom?.participants?.recipient;
    let isRecipientOnline = false;
    if (recipient) {
      isRecipientOnline = !!first(await this.redis.keys(`${UserRole.USER}:${recipient.user_id}:status*`));
    }

    const isBlocked = await this.sharedChatService.checkIsBlocked(
      chatroom.participants.recipient.user_id,
      chatroom.participants.self.user_id,
    );

    const property = await this.propertyService.findOnPartial(chatroom.property_id, {
      id: true,
      slug: true,
      title: true,
      feature_image: true,
    });

    const result = {
      id: chatroom.uuid,
      self: chatroom.participants.self,
      recipient: chatroom.participants.recipient,
      is_recipient_online: isRecipientOnline,
      is_blocked: isBlocked,
      property,
    };

    return { result };
  }

  @ApiOperation({ summary: 'Find messages' })
  @UseInterceptors(FindOneChatInterceptor)
  @Get(':chatroomId/messages')
  async findMessages(
    @Req() request: RequestType,
    @Param('chatroomId') chatroomId: string,
    @Query() dto: FindAllChatMessagesDto,
  ): Promise<SuccessResponseArgs> {
    //
    const chatroom: PartialChatroom = request.interceptor_data;

    /**
     * find messages
     */
    const result = await this.sharedChatService.findMessages(chatroom.id, dto.cursor);
    const serialized = MessengerMessagesSerializer.toArray(result.data);
    return { result: { data: serialized } };
  }

  @ApiOperation({ summary: 'Delete message' })
  @UseInterceptors(FindOneChatInterceptor)
  @Delete(':chatroomId/messages/:messageId')
  async deleteMessage(
    @Req() request: RequestType,
    @Param('chatroomId') chatroomId: string,
    @Param('messageId') messageId: number,
  ): Promise<SuccessResponseArgs> {
    const chatroom: PartialChatroom = request.interceptor_data;

    /**
     * find messages
     */
    await this.sharedChatService.deleteMessage(
      chatroom.id,
      chatroom.participants.self.participant_id,
      messageId,
    );

    if (chatroom?.participants?.recipient) {
      await this.socketService.emitDeleteMessage(chatroom.uuid, chatroom.participants.recipient.user_id);
    }

    return {};
  }

  @ApiOperation({ summary: 'Update read at' })
  @UseInterceptors(FindOneChatInterceptor)
  @Patch(':chatroomId/read-at')
  async updateReadAt(
    @Req() request: RequestType,
    @Param('chatroomId') chatroomId: string,
  ): Promise<SuccessResponseArgs> {
    const chatroom: PartialChatroom = request.interceptor_data;

    await this.sharedChatService.updateReadAt(chatroom.participants.self.participant_id);

    return {};
  }

  @ApiOperation({ summary: 'Unread messages count' })
  @Get('unread/count')
  async unreadCount(@Req() request: RequestType): Promise<SuccessResponseArgs> {
    const user = request.user;
    const unreadCount = await this.sharedChatService.unreadCount(user.id);

    return { result: { unread_count: unreadCount } };
  }

  @ApiOperation({ summary: 'Black List' })
  @UseInterceptors(FindOneChatInterceptor)
  @Post(':chatroomId/blacklist')
  async blacklist(
    @Req() request: RequestType,
    @Param('chatroomId') chatroomId: string,
    @Body() dto: BlockParticipantUserDto,
  ): Promise<SuccessResponseArgs> {
    const user = request.user;
    await this.sharedChatService.blacklist(dto, user.id);

    return {};
  }
}
