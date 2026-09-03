import { ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { CallHandler, NestInterceptor, NotFoundException } from '@nestjs/common';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { startOfToday } from 'src/common/helpers/date.helper';

@Injectable()
export class FindOneChatInterceptor implements NestInterceptor {
  constructor(private readonly db: PrismaService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id;
    const chatroomId = request.params?.chatroomId;
    if (!chatroomId) throw new NotFoundException('CHAT4');

    const item = await this.db.messengerChatroom.findUnique({
      where: { uuid: chatroomId },
      select: {
        id: true,
        uuid: true,
        created_at: true,
        property_id: true,
        property: { select: { id: true, status: true, subscription_expired_at: true } },
        participants: {
          where: { deleted_at: null },
          select: { id: true, user_id: true, role: true, message_read_at: true, user_mobile_number: true },
        },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');
    const sender = item.participants.find((e) => e.user_id === userId);
    const recipient = item.participants.find((e) => e.user_id !== userId);
    if (!sender) throw new ForbiddenException('CHAT13');
    const isPropertyExpired = item.property.subscription_expired_at < startOfToday();

    const data = {
      ...item,
      isPropertyExpired,
      participants: {
        self: sender
          ? {
              participant_id: sender.id,
              user_id: sender.user_id,
              role: sender.role,
              message_read_at: sender.message_read_at,
            }
          : null,
        recipient: recipient
          ? {
              participant_id: recipient.id,
              user_id: recipient.user_id,
              role: recipient.role,
              user_mobile_number: isPropertyExpired
                ? maskedUserMobile(recipient.user_mobile_number)
                : recipient.user_mobile_number,
            }
          : null,
      },
    };
    request.interceptor_data = data;
    return next.handle();
  }
}
