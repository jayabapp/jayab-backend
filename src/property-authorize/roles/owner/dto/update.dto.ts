import { PickType } from '@nestjs/mapped-types';
import { CreatePropertyAuthorizeOwnerDto } from './create.dto';

export class UpdatePropertyAuthorizeOwnerDto extends PickType(CreatePropertyAuthorizeOwnerDto, [
  'docs',
  'nc_image_id',
]) {}
