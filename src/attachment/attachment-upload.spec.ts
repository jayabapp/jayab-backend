import { BadRequestException } from '@nestjs/common';
import { randomBytes } from 'node:crypto';
import { AttachmentService } from './attachment.service';
import { AttachmentImagePropsType } from './interfaces/attachment-props.type';
import sharp from 'sharp';

describe('high resolution attachment processing', () => {
  const stored: Buffer[] = [];
  const create = jest.fn(async ({ data }) => data);
  const uploadObject = jest.fn(async ({ buffer, fs }) => {
    stored.push(buffer);
    return { bucket: 'test', end_point: 'test.invalid', fs: fs || 'mock' };
  });
  const service = new AttachmentService({ attachment: { create } } as never, { uploadObject } as never);
  const upload = (buffer: Buffer, options: Partial<AttachmentImagePropsType> = {}) =>
    service.createAttachment({
      file: { buffer, mimetype: 'image/png' } as Express.Multer.File,
      folder: 'test',
      resizeWidth: 1600,
      resizeMode: 'normal',
      lossless: true,
      ...options,
    });

  beforeEach(() => {
    stored.length = 0;
    jest.clearAllMocks();
  });

  it('accepts an image larger than 10 MiB without requiring low-quality input', async () => {
    const buffer = await sharp(randomBytes(2200 * 2200 * 3), {
      raw: { width: 2200, height: 2200, channels: 3 },
    })
      .jpeg({ quality: 100, chromaSubsampling: '4:4:4' })
      .toBuffer();
    expect(buffer.length).toBeGreaterThan(10 * 1024 * 1024);
    expect(buffer.length).toBeLessThan(30 * 1024 * 1024);
    await upload(buffer);
    expect(await sharp(stored[0]).metadata()).toMatchObject({ width: 1600, height: 1600, format: 'webp' });
    expect(stored).toHaveLength(3);
  }, 30_000);

  it('preserves every source pixel in the main image when no resizing is necessary', async () => {
    const pixels = randomBytes(64 * 48 * 3);
    const source = await sharp(pixels, { raw: { width: 64, height: 48, channels: 3 } })
      .png()
      .toBuffer();
    await upload(source);
    const decoded = await sharp(stored[0]).removeAlpha().raw().toBuffer();
    expect(decoded).toEqual(pixels);
    expect(await sharp(stored[0]).metadata()).toMatchObject({ width: 64, height: 48 });
  });

  it('limits the longest side after EXIF rotation and keeps document text at the requested resolution', async () => {
    const source = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#346789' } })
      .jpeg()
      .withMetadata({ orientation: 6 })
      .toBuffer();
    await upload(source, { resizeWidth: 2560 });
    const metadata = await sharp(stored[0]).metadata();
    expect(metadata.height).toBe(2560);
    expect(metadata.width).toBeLessThan(2560);
    expect(metadata.width).toBeGreaterThan(800);
    expect(metadata.orientation).toBeUndefined();
  });

  it('returns an explicit pixel limit error before allocating an oversized image', async () => {
    const source = Buffer.from(
      '<svg xmlns="http://www.w3.org/2000/svg" width="20000" height="20000"><rect width="100%" height="100%"/></svg>',
    );
    await expect(upload(source)).rejects.toThrow('ATTACH_IMAGE_PIXEL_LIMIT');
    expect(uploadObject).not.toHaveBeenCalled();
  });

  it('returns readable validation errors for corrupted or undersized images', async () => {
    await expect(upload(Buffer.from('not an image'))).rejects.toThrow('ATTACH_IMAGE_INVALID');
    const small = await sharp({ create: { width: 16, height: 16, channels: 3, background: 'white' } })
      .png()
      .toBuffer();
    await expect(upload(small)).rejects.toEqual(new BadRequestException('ATTACH2'));
    expect(uploadObject).not.toHaveBeenCalled();
  });
});
