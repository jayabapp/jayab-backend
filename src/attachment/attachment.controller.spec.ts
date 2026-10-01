import { ForbiddenException } from '@nestjs/common';
import { AttachmentUserFolder } from './interfaces/attachment-folder.enum';
import { AttachmentController } from './attachment.controller';

describe('AttachmentController', () => {
  const attachmentService = { createAttachment: jest.fn() };
  const setting = { isGuestChatEnabled: jest.fn() };

  let controller: AttachmentController;

  beforeEach(() => {
    jest.clearAllMocks();
    setting.isGuestChatEnabled.mockResolvedValue(false);
    controller = new AttachmentController(attachmentService as any, {} as any, setting as any);
  });

  it('rejects chat uploads before they reach storage while chat is suspended', async () => {
    await expect(
      controller.uploadUserImageAttachment(
        { user: { id: 1 } } as any,
        { type: AttachmentUserFolder.CHAT },
        {} as Express.Multer.File,
      ),
    ).rejects.toEqual(new ForbiddenException('CHAT13'));

    expect(attachmentService.createAttachment).not.toHaveBeenCalled();
  });
});
