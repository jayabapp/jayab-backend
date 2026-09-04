import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { AttachmentImagePropsType, AttachmentVoicePropsType } from './interfaces/attachment-props.type';
import { DEFAULT_IMAGE_ENCODING_QUALITY, IMAGE_WEBP_OPTIONS } from './constants/image-processing.constant';
import { Attachment, Prisma } from '@prisma/client';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';
import { PrismaService } from 'src/prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';
import { VIDEO_FOLDER } from 'src/common/utils/constants/storage-folders';
import { __baseDir } from 'src/config/settings';
import { Readable } from 'stream';

import sharp from 'sharp';
import md5 from 'crypto-js/md5';
import fs from 'fs/promises';

@Injectable()
export class AttachmentService {
  private static readonly IMMUTABLE_CACHE_CONTROL = 'public, max-age=31536000, immutable';
  private readonly logger = new Logger(AttachmentService.name);

  constructor(
    private readonly db: PrismaService,
    private readonly s3ManagerService: S3ManagerService,
  ) {}

  /* ---------------------------------- IMAGE --------------------------------- */
  async getPublicPropertyImageDownload(id: number): Promise<{
    contentLength?: number;
    stream: Readable;
  }> {
    const attachment = await this.db.attachment.findFirst({
      where: {
        id,
        deleted_at: null,
        type: 1,
        OR: [
          {
            feature_image: {
              some: { status: PropertyStatuses.PUBLISHED, deleted_at: null },
            },
          },
          {
            property_images: {
              some: {
                property: {
                  status: PropertyStatuses.PUBLISHED,
                  deleted_at: null,
                },
              },
            },
          },
        ],
      },
      select: { name: true, path: true },
    });
    if (!attachment) throw new NotFoundException('NOT_FOUND');

    const object = await this.s3ManagerService.getObject(`${attachment.path}/${attachment.name}`);
    if (!object.Body) throw new NotFoundException('NOT_FOUND');

    return {
      contentLength: object.ContentLength,
      stream: object.Body as Readable,
    };
  }

  async createAttachment(args: AttachmentImagePropsType): Promise<Attachment> {
    const {
      file,
      folder,
      resizeWidth,
      resizeMode,
      adminId,
      userId,
      repository = 'attachment',
      alt,
      encodingQuality = DEFAULT_IMAGE_ENCODING_QUALITY,
    } = args;
    const MIN_WIDTH = 32;
    const MIN_HEIGHT = 32;

    const image = sharp(file.buffer).rotate();
    const largeImage = sharp(file.buffer).rotate();
    const mediumImage = sharp(file.buffer).rotate();
    const thumbImage = sharp(file.buffer).rotate();

    const metadata = await image.metadata();
    const { width, height } = metadata;

    const isVertical = width >= height;

    if (width < MIN_WIDTH || height < MIN_HEIGHT) throw new BadRequestException('ATTACH2');
    const resizeDimension: { width?: number; height?: number } =
      resizeMode == 'square'
        ? { width: Math.floor(resizeWidth), height: Math.floor(resizeWidth) }
        : resizeMode == '1/2'
          ? { width: Math.floor(resizeWidth), height: Math.floor(resizeWidth * 0.5) }
          : resizeMode == '2/3'
            ? { width: Math.floor(resizeWidth), height: Math.floor(resizeWidth * 0.666) }
            : resizeMode == '2/5'
              ? { width: Math.floor(resizeWidth), height: Math.floor(resizeWidth * 0.4) }
              : resizeMode == '1/4'
                ? { width: Math.floor(resizeWidth), height: Math.floor(resizeWidth * 0.25) }
                : isVertical
                  ? { width: width > resizeWidth ? Math.floor(resizeWidth) : Math.floor(width) }
                  : { height: height > resizeWidth ? Math.floor(resizeWidth) : Math.floor(height) };

    let resizeDimensionMedium = {};
    let resizeDimensionThumb = {};
    if (resizeDimension.width) {
      resizeDimensionMedium = { ...resizeDimensionMedium, width: Math.floor(resizeDimension.width / 2) };
      resizeDimensionThumb = { ...resizeDimensionThumb, width: Math.floor(resizeDimension.width / 4) };
    }
    if (resizeDimension.height) {
      resizeDimensionMedium = { ...resizeDimensionMedium, height: Math.floor(resizeDimension.height / 2) };
      resizeDimensionThumb = { ...resizeDimensionThumb, height: Math.floor(resizeDimension.height / 4) };
    }

    const fileName = `${uuidv4()}-${new Date().getTime()}-${width}x${height}.webp`;
    const largeName = `${fileName}`;
    const mediumName = `medium-${fileName}`;
    const thumbName = `thumb-${fileName}`;
    const fitMode = ['square', '1/2', '2/3', '2/5'].includes(resizeMode) ? 'cover' : 'contain';

    const l = await largeImage
      .resize({
        ...resizeDimension,
        fit: fitMode,
        withoutEnlargement: true,
      })
      .webp({ quality: encodingQuality.large, ...IMAGE_WEBP_OPTIONS })
      .toBuffer();

    const mainOnS3 = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${largeName}`,
      buffer: l,
      cacheControl: AttachmentService.IMMUTABLE_CACHE_CONTROL,
      contentType: 'image/webp',
    });

    let mediumKey: string | null = null;
    let thumbnailKey: string | null = null;

    try {
      const m = await mediumImage
        .resize({
          ...resizeDimensionMedium,
          fit: fitMode,
          withoutEnlargement: true,
        })
        .webp({ quality: encodingQuality.medium, ...IMAGE_WEBP_OPTIONS })
        .toBuffer();

      const mediumOnS3 = await this.s3ManagerService.uploadObject({
        fullPath: `${folder}/${mediumName}`,
        buffer: m,
        cacheControl: AttachmentService.IMMUTABLE_CACHE_CONTROL,
        contentType: 'image/webp',
        fs: mainOnS3.fs,
      });

      if (mediumOnS3?.bucket) mediumKey = mediumName;
    } catch (error) {
      this.logger.warn(
        `Medium derivative upload failed for ${fileName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    try {
      const t = await thumbImage
        .resize({
          ...resizeDimensionThumb,
          fit: fitMode,
          withoutEnlargement: true,
        })
        .webp({ quality: encodingQuality.thumbnail, ...IMAGE_WEBP_OPTIONS })
        .toBuffer();

      const thumbOnS3 = await this.s3ManagerService.uploadObject({
        fullPath: `${folder}/${thumbName}`,
        buffer: t,
        cacheControl: AttachmentService.IMMUTABLE_CACHE_CONTROL,
        contentType: 'image/webp',
        fs: mainOnS3.fs,
      });

      if (thumbOnS3?.bucket) thumbnailKey = thumbName;
    } catch (error) {
      this.logger.warn(
        `Thumbnail derivative upload failed for ${fileName}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    let updateData: Prisma.AttachmentUncheckedCreateInput = {
      name: largeName,
      medium: mediumKey,
      thumbnail: thumbnailKey,
      bucket: mainOnS3.bucket,
      end_point: mainOnS3.end_point,
      alt: alt,
      type: 1,
      path: folder,
    };

    if (repository == 'attachment')
      updateData = { ...updateData, admin_id: adminId || null, user_id: userId || null };

    let data: Attachment;
    if (repository == 'attachment')
      data = await this.db.attachment.create({
        data: updateData,
      });

    return data;
  }

  /**
   * upload gif
   * @param args
   * @returns
   */
  async createGif(args: AttachmentImagePropsType): Promise<Attachment> {
    const { file, folder, adminId, alt } = args;
    const gif = sharp(file.buffer);
    const metadata = await gif.metadata();
    const { width, height } = metadata;

    const hashOriginalName = md5(file.originalname).toString().substring(3, 9);
    const fileName = `${uuidv4()}-${hashOriginalName}-${new Date().getTime()}-${width}x${height}.gif`;

    const uploadedObj = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${fileName}`,
      buffer: file.buffer,
      cacheControl: AttachmentService.IMMUTABLE_CACHE_CONTROL,
      contentType: 'image/gif',
    });

    const data = await this.db.attachment.create({
      data: {
        name: fileName,
        bucket: uploadedObj.bucket,
        end_point: uploadedObj.end_point,
        alt: alt,
        type: 1,
        path: folder,
        admin_id: adminId,
      },
    });

    return data;
  }
  /* ---------------------------------- VOICE --------------------------------- */
  async createVoice(args: AttachmentVoicePropsType): Promise<Attachment> {
    const { file, folder, adminId, repository = 'attachment' } = args;

    const hashOriginalName = md5(file.originalname).toString();
    const mime = file.mimetype.split('/')[1];
    const fileName = `${uuidv4()}-${hashOriginalName}-${new Date().getTime()}.${mime}`;

    const mainOnS3 = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${fileName}`,
      buffer: file.buffer,
      cacheControl: AttachmentService.IMMUTABLE_CACHE_CONTROL,
      contentType: file.mimetype || 'application/octet-stream',
    });
    let updateData: Prisma.AttachmentUncheckedCreateInput = {
      name: fileName,
      bucket: mainOnS3.bucket,
      end_point: mainOnS3.end_point,
      type: 3,
      path: folder,
    };
    if (repository == 'attachment') updateData = { ...updateData, admin_id: adminId || null };

    //Save to DB
    let data: Attachment;
    if (repository == 'attachment')
      data = await this.db.attachment.create({
        data: updateData,
      });
    return data;
  }

  async createVideo(adminId: number, file: Express.Multer.File): Promise<Attachment> {
    const folder = VIDEO_FOLDER;
    const hashOriginalName = md5(file.originalname).toString();
    const mime = file.mimetype.split('/')[1];
    const fileName = `${uuidv4()}-${hashOriginalName}-${new Date().getTime()}.${mime}`;

    const mainOnS3 = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${fileName}`,
      buffer: file.buffer,
      cacheControl: AttachmentService.IMMUTABLE_CACHE_CONTROL,
      contentType: file.mimetype || 'application/octet-stream',
    });

    const createData: Prisma.AttachmentUncheckedCreateInput = {
      name: fileName,
      bucket: mainOnS3.bucket,
      end_point: mainOnS3.end_point,
      type: 2,
      path: folder,
      admin_id: adminId,
    };

    //Save to DB
    const data = await this.db.attachment.create({
      data: createData,
    });

    return data;
  }

  /**
   * Check files owner - can use in all controllers
   * @param files
   * @param userId
   * @returns
   */
  async validateFileOwner(files: number[], userId?: number, type?: 1 | 2): Promise<boolean> {
    let query: Prisma.AttachmentWhereInput = { id: { in: files } };
    if (userId) query = { ...query, user_id: userId };
    if (type) query = { ...query, type: type ?? 1 };

    const attachmentsCount = await this.db.attachment.count({
      where: query,
    });

    if (attachmentsCount === files.length) return true;
    else throw new BadRequestException('AUTH3');
  }

  async findOne(id: number): Promise<boolean> {
    const file = await this.db.attachment.findFirst({ where: { id } });
    if (!file) throw new BadRequestException('BANNER1');
    return true;
  }

  async remove(id: number): Promise<boolean> {
    await this.db.attachment.delete({ where: { id } });
    return;
  }

  async createAttachmentInMigration(args: {
    fileName: string;
    file: Buffer;
    thumbFile: Buffer;
    folder: string;
    userId?: number;
    adminId?: number;
  }): Promise<void> {
    try {
      const { fileName, file, thumbFile } = args;

      const largeImage = sharp(file);
      const mediumImage = sharp(file);
      const thumbImage = sharp(thumbFile);

      const name = `${fileName.replace('.jpg', '.webp')}`;
      const largeName = `${name}`;
      const mediumName = `medium-v1-${name}`;
      const thumbName = `thumbnail-${name}`;
      const fitMode = 'contain';
      const l = await largeImage.webp().toBuffer();

      const m = await mediumImage
        .resize({
          width: 400,
          height: 400,
          fit: fitMode,
        })
        .webp()
        .toBuffer();

      const t = await thumbImage.webp().toBuffer();

      await fs.writeFile(`${__baseDir}/storage/v1/ownerwebp/${largeName}`, l);
      await fs.writeFile(`${__baseDir}/storage/v1/ownerwebp/${mediumName}`, m);
      await fs.writeFile(`${__baseDir}/storage/v1/ownerwebp/${thumbName}`, t);
    } catch (error) {
      console.log(error);
    }
  }
}
