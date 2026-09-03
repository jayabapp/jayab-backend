import { FILE_SERVERS_TYPE } from '../common/s3.constants';

export type S3ObjectInputType = {
  fullPath: string;
  buffer: Buffer;
  cacheControl?: string;
  contentType: string;
  fs?: FILE_SERVERS_TYPE;
};
