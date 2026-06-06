export enum SocketEvents {
  CLIENT_CONNECTED = 'client-connected',

  ADMIN_HANDSHAKE = 'admin:handshake',
  USER_HANDSHAKE = 'user:handshake',

  USER_STATUS = 'user:status',

  CHAT_NEW_MESSAGE = 'chat:new-message',
  CHAT_IS_TYPING = 'chat:is-typing',
  CHAT_MESSAGE_DELETED = 'chat:message-deleted',

  NEW_NOTIFICATION = 'event:new-notification',

  ORDER_STATUS_UPDATED = 'order:status-updated',

  NEW_RESERVE = 'event:new-reserve',
}
