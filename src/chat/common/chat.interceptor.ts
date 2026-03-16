import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { maskedUserMobile } from 'src/common/helpers/masked-user-mobile.helper';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FindOneChatInterceptor implements NestInterceptor {
  constructor(private readonly db: PrismaService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;
    const isAdmin = request.user?.role_id;

    const chatroomId = request.params?.chatroomId;
    if (!chatroomId) throw new BadRequestException('CHAT1');

    /* -------------------------------------------------------------------------- */
    const item = await this.db.messengerChatroom.findUnique({
      where: { uuid: chatroomId },
      select: {
        id: true,
        uuid: true,
        created_at: true,
        property_id: true,
        property: { select: { id: true, status: true, subscription_expired_at: true } },
        last_message: { select: { created_at: true } },
        participants: {
          where: { deleted_at: null },
          select: { id: true, user_id: true, role: true, message_read_at: true, user_mobile_number: true },
        },
      },
    });

    /* -------------------------------------------------------------------------- */
    if (!item) throw new BadRequestException('NOT_FOUND');

    //ممکنه ای دی کاربر و ادمین یکی باشه در نتیجه رول هم باید چک بشه
    const sender = item.participants.find((e) => e.user_id === userId);
    const recipient = item.participants.find((e) => e.user_id !== userId);

    // console.log({ sender, recipient });

    if (!sender) throw new BadRequestException('CHAT3');

    /* -------------------------------------------------------------------------- */
    request.interceptor_data = {
      ...item,
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
              user_mobile_number: maskedUserMobile(recipient.user_mobile_number),
            }
          : null,
      },
    };

    return next.handle();
  }
}
