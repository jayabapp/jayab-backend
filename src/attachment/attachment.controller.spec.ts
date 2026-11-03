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
    ).rejects.toEqual(new ForbiddenException('CHAT14'));

    expect(attachmentService.createAttachment).not.toHaveBeenCalled();
  });

  it.each([
    [AttachmentUserFolder.PROFILE, 1024],
    [AttachmentUserFolder.OWNER_SELFIE_IMAGE, 1024],
    [AttachmentUserFolder.ADVISOR_NATIONAL_CARD_IMAGE, 2560],
    [AttachmentUserFolder.ADVISOR_DOCUMENT_IMAGE, 2560],
    [AttachmentUserFolder.OWNER_PROPERTY_DOCS, 2560],
    [AttachmentUserFolder.OWNER_PROPERTY_IMAGE, 1600],
  ])('accepts high quality input for %s and only caps output dimensions', async (type, resizeWidth) => {
    const file = { buffer: Buffer.from('test input') } as Express.Multer.File;
    await controller.uploadUserImageAttachment({ user: { id: 1, owner_id: 2 } } as any, { type }, file);
    expect(attachmentService.createAttachment).toHaveBeenCalledWith(
      expect.objectContaining({
        file,
        resizeWidth,
        lossless: true,
      }),
    );
  });
});
