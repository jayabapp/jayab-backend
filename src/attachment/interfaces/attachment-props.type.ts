import type { ImageEncodingQuality } from '../constants/image-processing.constant';

export type AttachmentImagePropsType = {
  file: Express.Multer.File;
  alt?: string;
  folder: string;
  userId?: number;
  adminId?: number;
  resizeWidth: number;
  encodingQuality?: ImageEncodingQuality;
  repository?: 'attachment' | 'messengerMedia';
  resizeMode: 'normal' | 'square' | '1/2' | '2/3' | '2/5' | '1/4';
};

export type AttachmentVoicePropsType = {
  file: Express.Multer.File;
  folder: string;
  userId?: number;
  adminId?: number;
  repository?: 'attachment' | 'messengerMedia';
};
