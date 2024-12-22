import { FILE_SERVERS_TYPE } from '../common/s3.constants';

export type S3ObjectInputType = {
  fullPath: string;
  buffer: Buffer;
  fs?: FILE_SERVERS_TYPE;
};
