import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { UserRole } from 'src/common/interfaces/role.enum';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class FindOneChatInterceptor implements NestInterceptor {
  constructor(private readonly db: PrismaService) {}
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();

    const userId = request.user.id;
    const isAdmin = request.user?.role_id;
    const recipientRole = isAdmin ? UserRole.USER : UserRole.ADMIN;

    const chatroomId = request.params?.chatroomId;
    if (!chatroomId) throw new BadRequestException('CHAT1');

    /* -------------------------------------------------------------------------- */
    const item = await this.db.messengerChatroom.findUnique({
      where: { uuid: chatroomId },
      select: {
        id: true,
        uuid: true,
        created_at: true,
        property: { select: { id: true, status: true } },
        participants: {
          where: { deleted_at: null },
          select: { id: true, user_id: true, role: true, message_read_at: true },
        },
      },
    });

    /* -------------------------------------------------------------------------- */
    if (!item) throw new BadRequestException('CHAT0');

    //ممکنه ای دی کاربر و ادمین یکی باشه در نتیجه رول هم باید چک بشه
    const sender = item.participants.find((e) => e.user_id === userId && e.role !== recipientRole);
    const recipient = item.participants.find((e) => e.role === recipientRole);

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
          ? { participant_id: recipient.id, user_id: recipient.user_id, role: recipient.role }
          : null,
      },
    };

    return next.handle();
  }
}
