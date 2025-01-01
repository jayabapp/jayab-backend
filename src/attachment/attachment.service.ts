import { BadRequestException, Injectable } from '@nestjs/common';
import { Attachment, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import sharp from 'sharp';
import md5 from 'crypto-js/md5';
import { S3ManagerService } from 'src/s3-manager/s3-manager.service';
import { AttachmentImagePropsType, AttachmentVoicePropsType } from './interfaces/attachment-props.type';
import { v4 as uuidv4 } from 'uuid';
import { VIDEO_FOLDER } from 'src/common/utils/constants/storage-folders';

@Injectable()
export class AttachmentService {
  constructor(
    private readonly db: PrismaService,
    private readonly s3ManagerService: S3ManagerService,
  ) {}

  /* ---------------------------------- IMAGE --------------------------------- */
  async createAttachment(args: AttachmentImagePropsType): Promise<Attachment> {
    const { file, folder, resizeWidth, resizeMode, adminId, userId, repository = 'attachment', alt } = args;

    // const storagePath = STORAGE_PUBLIC + folder;
    const MIN_WIDTH = 32;
    const MIN_HEIGHT = 32;

    const image = sharp(file.buffer);
    const largeImage = sharp(file.buffer);
    const mediumImage = sharp(file.buffer);
    const thumbImage = sharp(file.buffer);

    const metadata = await image.metadata();
    const { width, height } = metadata;

    const isVertical = width >= height;

    if (width < MIN_WIDTH || height < MIN_HEIGHT) throw new BadRequestException('ATTACH2');
    // if (resizeMode == 'square' && width != height) throw new BadGatewayException('ATTACH1');

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

    // console.log({ resizeDimension, resizeDimensionMedium, resizeDimensionThumb });

    /**
     * Create file name
     */
    const hashOriginalName = md5(file.originalname).toString().substring(3, 9);
    const fileName = `${uuidv4()}-${hashOriginalName}-${new Date().getTime()}-${width}x${height}.webp`;
    const largeName = `${fileName}`;
    const mediumName = `medium-${fileName}`;
    const thumbName = `thumb-${fileName}`;
    const fitMode = ['square', '1/2', '2/3', '2/5'].includes(resizeMode) ? 'cover' : 'contain';

    /**
     * resize image
     */
    const l = await largeImage
      .resize({
        ...resizeDimension,
        fit: fitMode,
        // background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp()
      .toBuffer();

    const m = await mediumImage
      .resize({
        ...resizeDimensionMedium,
        fit: fitMode,
      })
      .webp()
      .toBuffer();

    const t = await thumbImage
      .resize({
        ...resizeDimensionThumb,
        fit: fitMode,
      })
      .webp()
      .toBuffer();

    /**
     * save to S3
     */

    //original
    const mainOnS3 = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${largeName}`,
      buffer: l,
    });

    //medium
    await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${mediumName}`,
      buffer: m,
      fs: mainOnS3.fs,
    });

    //thumbnail
    await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${thumbName}`,
      buffer: t,
      fs: mainOnS3.fs,
    });

    let updateData: Prisma.AttachmentUncheckedCreateInput = {
      name: largeName,
      medium: mediumName,
      thumbnail: thumbName,
      // meta: (metadata || {}) as Prisma.JsonValue,
      bucket: mainOnS3.bucket,
      end_point: mainOnS3.end_point,
      alt: alt,
      type: 1,
      path: folder,
    };

    if (repository == 'attachment')
      updateData = { ...updateData, admin_id: adminId || null, user_id: userId || null };

    //Save to DB
    let data: Attachment;
    if (repository == 'attachment')
      data = await this.db.attachment.create({
        data: updateData,
      });
    // else
    //   data = await this.db.messengerMedia.create({
    //     data: updateData,
    //   });

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
    const fileName = `${uuidv4()}-${hashOriginalName}-${new Date().getTime()}-${width}x${height}.webp`;

    const uploadedObj = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${fileName}`,
      buffer: file.buffer,
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

    /**
     * save to S3
     */
    const mainOnS3 = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${fileName}`,
      buffer: file.buffer,
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
    // else
    //   data = await this.db.messengerMedia.create({
    //     data: updateData,
    //   });

    return data;
  }

  async createVideo(adminId: number, file: Express.Multer.File): Promise<Attachment> {
    const folder = VIDEO_FOLDER;
    const hashOriginalName = md5(file.originalname).toString();
    const mime = file.mimetype.split('/')[1];
    const fileName = `${uuidv4()}-${hashOriginalName}-${new Date().getTime()}.${mime}`;

    /**
     * save to S3
     */
    const mainOnS3 = await this.s3ManagerService.uploadObject({
      fullPath: `${folder}/${fileName}`,
      buffer: file.buffer,
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
}
