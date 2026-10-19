import type { ImageEncodingQuality } from '../constants/image-processing.constant';

export type AttachmentImagePropsType = {
  alt?: string;
  folder: string;
  userId?: number;
  adminId?: number;
  lossless?: boolean;
  resizeWidth: number;
  file: Express.Multer.File;
  encodingQuality?: ImageEncodingQuality;
  repository?: 'attachment' | 'messengerMedia';
  resizeMode: 'normal' | 'square' | '1/2' | '2/3' | '2/5' | '1/4';
};

export type AttachmentVoicePropsType = {
  folder: string;
  userId?: number;
  adminId?: number;
  file: Express.Multer.File;
  repository?: 'attachment' | 'messengerMedia';
};
