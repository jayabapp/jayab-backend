import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { S3ObjectInputType } from './interfaces/s3.interface';
import { ConfigService } from '@nestjs/config';
import { sample } from 'lodash';
import { FILE_SERVERS, FILE_SERVERS_TYPE } from './common/s3.constants';
import { PutObjectCommand, PutObjectCommandOutput, S3, S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3ManagerService {
  constructor(
    @Inject('fs1')
    private readonly fs1: S3Client,
    // @Inject('fs2')
    // private readonly fs2: S3,
    // @Inject('fs3')
    // private readonly fs3: S3,
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
      // case 'fs2':
      //   fileServer = this.fs2;
      //   endPoint = this.configService.get('aws.fs2.endPoint');
      //   break;
      // case 'fs3':
      //   fileServer = this.fs3;
      //   endPoint = this.configService.get('aws.fs3.endPoint');
      //   break;

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
        }),
      );

      return { bucket: this.BUCKET_NAME, end_point: endPoint, fs: randomFileServer };
    } catch (error) {
      console.log('FILE UPLOAD ERROR');
      console.log(error);
    }
  }
}
