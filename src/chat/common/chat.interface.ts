import { Attachment } from '@prisma/client';
import { UserRole } from 'src/common/interfaces/role.enum';

export type PartialChatroom = {
  id: number;
  uuid: string;
  created_at: Date;
  deposit: {
    id: number;
    status: number;
  };
  participants: {
    self: PartialParticipant;
    recipient: PartialParticipant;
  };
};

export type PartialParticipant = {
  participant_id: number;
  user_id: number;
  role: UserRole;
  message_read_at: Date;
};

export type UserChatroomType = {
  id: number;
  full_name: string;
  mobile_number: string;
  avatar: Attachment;
  fcm_token: string;
};

export type AdminChatroomType = { id: number; full_name: string };
