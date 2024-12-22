export type AttachmentImagePropsType = {
  file: Express.Multer.File;
  folder: string;
  resizeWidth: number;
  resizeMode: 'normal' | 'square' | '1/2' | '2/3' | '2/5' | '1/4';
  userId?: number;
  adminId?: number;
  repository?: 'attachment' | 'messengerMedia';
  alt?: string;
};

export type AttachmentVoicePropsType = {
  file: Express.Multer.File;
  folder: string;
  userId?: number;
  adminId?: number;
  repository?: 'attachment' | 'messengerMedia';
};
