import { SocketEvents } from './socket-event.enum';

export type SocketEventData = {
  event: SocketEvents;
  token: string;
  adminId?: number;
  userId?: number;
};

export type SocketEventChatIsTypingData = {
  chatroom_id: string;
  participant_id: number;
  is_typing: boolean;
};
