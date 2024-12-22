import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { ApiBody, ApiConsumes } from '@nestjs/swagger';
import { fileMimetypeFilter } from '../filters/file-mimetype.filter';

export function ApiFile(fieldName = 'file', required = false, localOptions?: MulterOptions): any {
  return applyDecorators(
    UseInterceptors(FileInterceptor(fieldName, localOptions)),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        required: required ? [fieldName] : [],
        properties: {
          [fieldName]: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    }),
  );
}

export function ApiImageFile(fileName = 'image', required = false): any {
  return ApiFile(fileName, required, {
    fileFilter: fileMimetypeFilter(
      'png',
      'jpg',
      'jpeg',
      'JPG',
      'JPEG',
      'svg',
      'svg+xml',
      'webp',
      'avif',
      'gif',
    ),
    limits: {
      fileSize: 1024 * 1024 * 4,
    },
  });
}

export function ApiVoiceFile(fileName = 'audio', required = false): any {
  return ApiFile(fileName, required, {
    fileFilter: fileMimetypeFilter('mp3', 'wav', 'mpeg', 'ogg', 'flac', 'aac'),
    limits: {
      fileSize: 1024 * 1024 * 30,
    },
  });
}

export function ApiPdfFile(fileName = 'document', required = false): any {
  return ApiFile(fileName, required, {
    fileFilter: fileMimetypeFilter('pdf'),
  });
}

export function ApiVideoFile(fileName = 'video', required = false): any {
  return ApiFile(fileName, required, {
    fileFilter: fileMimetypeFilter('3gp', 'avi', 'mp4'),
    limits: {
      fileSize: 1024 * 1024 * 20,
    },
  });
}
