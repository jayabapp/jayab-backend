import { NotFoundException } from '@nestjs/common';
import { Readable } from 'stream';

import { AttachmentService } from './attachment.service';

describe('AttachmentService public property image download', () => {
  const findFirst = jest.fn();
  const getObject = jest.fn();
  const service = new AttachmentService(
    { attachment: { findFirst } } as never,
    { getObject } as never,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects attachments that are not connected to a published property', async () => {
    findFirst.mockResolvedValue(null);

    await expect(service.getPublicPropertyImageDownload(42)).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(getObject).not.toHaveBeenCalled();
  });

  it('streams the original WebP object for a public property image', async () => {
    const stream = Readable.from(Buffer.from('webp'));
    findFirst.mockResolvedValue({
      name: 'image.webp',
      path: 'jayab/images/properties',
    });
    getObject.mockResolvedValue({ Body: stream, ContentLength: 4 });

    await expect(service.getPublicPropertyImageDownload(7)).resolves.toEqual({
      contentLength: 4,
      stream,
    });
    expect(getObject).toHaveBeenCalledWith('jayab/images/properties/image.webp');
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: 7, deleted_at: null, type: 1 }),
      }),
    );
  });

  it('does not return an empty S3 response as a downloadable file', async () => {
    findFirst.mockResolvedValue({
      name: 'missing.webp',
      path: 'jayab/images/properties',
    });
    getObject.mockResolvedValue({});

    await expect(service.getPublicPropertyImageDownload(9)).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
