import { BadRequestException, Inject, Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { FILE_SERVERS, FILE_SERVERS_TYPE } from './common/s3.constants';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { S3ObjectInputType } from './interfaces/s3.interface';
import { ConfigService } from '@nestjs/config';
import { sample } from 'lodash';

@Injectable()
export class S3ManagerService {
  private readonly logger = new Logger(S3ManagerService.name);

  constructor(
    @Inject('fs1')
    private readonly fs1: S3Client,
    private readonly configService: ConfigService,
  ) {}

  BUCKET_NAME = this.configService.get('aws.bucket');

  async uploadObject(
    body: S3ObjectInputType,
  ): Promise<{ bucket: string; end_point: string; fs: FILE_SERVERS_TYPE }> {
    const randomFileServer: FILE_SERVERS_TYPE = body.fs || sample(FILE_SERVERS);
    let fileServer: S3Client;
    let endPoint: string;
    switch (randomFileServer) {
      case 'fs1':
        fileServer = this.fs1;
        endPoint = this.configService.get('aws.fs1.endPoint');
        break;
      default:
        throw new BadRequestException('Wrong fs');
    }

    try {
      await fileServer.send(
        new PutObjectCommand({
          Bucket: this.BUCKET_NAME,
          Key: body.fullPath,
          Body: body.buffer,
          ACL: 'public-read',
          CacheControl: body.cacheControl,
          ContentType: body.contentType,
        }),
      );

      return { bucket: this.BUCKET_NAME, end_point: endPoint, fs: randomFileServer };
    } catch (error) {
      this.logger.error(
        `S3 upload failed for ${body.fullPath} on ${randomFileServer}`,
        error instanceof Error ? error.stack : String(error),
      );
      throw new ServiceUnavailableException('FILE_UPLOAD_FAILED');
    }
  }
}
