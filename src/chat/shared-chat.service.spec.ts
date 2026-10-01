import { ForbiddenException } from '@nestjs/common';
import { SharedChatService } from './shared-chat.service';

describe('SharedChatService', () => {
  const chatSmsQueue = { add: jest.fn() };
  const db = {
    messengerMessages: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };
  const setting = { isGuestChatEnabled: jest.fn() };

  let service: SharedChatService;

  beforeEach(() => {
    jest.clearAllMocks();
    setting.isGuestChatEnabled.mockResolvedValue(true);
    service = new SharedChatService(chatSmsQueue as any, db as any, {} as any, {} as any, setting as any);
  });

  it('rejects writes while the incident chat switch is disabled', async () => {
    setting.isGuestChatEnabled.mockResolvedValue(false);

    await expect(service.assertChatEnabled()).rejects.toEqual(new ForbiddenException('CHAT13'));
  });

  it('does not allow a message to be deleted while chat is suspended', async () => {
    setting.isGuestChatEnabled.mockResolvedValue(false);

    await expect(service.deleteMessage(1, 2, 3)).rejects.toEqual(new ForbiddenException('CHAT13'));
    expect(db.messengerMessages.findFirst).not.toHaveBeenCalled();
    expect(db.messengerMessages.update).not.toHaveBeenCalled();
  });

  it('only permits deleting a message created within the last minute', async () => {
    db.messengerMessages.findFirst.mockResolvedValueOnce({
      id: 3,
      created_at: new Date(Date.now() - 120_000),
    });

    await expect(service.deleteMessage(1, 2, 3)).rejects.toMatchObject({ message: 'CHAT4' });
    expect(db.messengerMessages.update).not.toHaveBeenCalled();

    db.messengerMessages.findFirst.mockResolvedValueOnce({
      id: 3,
      created_at: new Date(Date.now() - 10_000),
    });

    await expect(service.deleteMessage(1, 2, 3)).resolves.toBeUndefined();
    expect(db.messengerMessages.update).toHaveBeenCalledWith({
      where: { id: 3 },
      data: { deleted_at: expect.any(Date) },
    });
  });
});
