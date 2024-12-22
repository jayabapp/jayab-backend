import { UnsupportedMediaTypeException } from '@nestjs/common';

export function fileMimetypeFilter(...mimetypes: string[]) {
  return (req, file: Express.Multer.File, callback: (error: Error | null, acceptFile: boolean) => void) => {
    const mime = file.mimetype.split('/');
    const fileType = Array.isArray(mime) && mime?.length > 0 ? mime[1] : undefined;
    if (mimetypes.some((m) => m == fileType)) {
      callback(null, true);
    } else {
      callback(
        new UnsupportedMediaTypeException(`File type is not matching: ${mimetypes.join(', ')}`),
        false,
      );
    }
  };
}
