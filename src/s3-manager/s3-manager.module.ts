import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3ManagerService } from './s3-manager.service';
import { S3Client } from '@aws-sdk/client-s3';

@Module({
  providers: [
    S3ManagerService,
    {
      provide: 'fs1',
      useFactory: async (config: ConfigService) =>
        new S3Client({
          credentials: {
            accessKeyId: config.get('aws.fs1.accessKey'),
            secretAccessKey: config.get('aws.fs1.secretKey'),
          },
          region: config.get('aws.region'),
          endpoint: `https://${config.get('aws.fs1.endPoint')}`,
        }),
      inject: [ConfigService],
    },
  ],
  exports: [S3ManagerService],
})
export class S3ManagerModule {}
