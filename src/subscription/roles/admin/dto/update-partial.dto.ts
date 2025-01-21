import { PickType } from '@nestjs/mapped-types';
import { CreateSubscriptionAdminDto } from './create.dto';

export class UpdatePartialSubscriptionAdminDto {}
// export class UpdatePartialSubscriptionAdminDto extends PickType(CreateSubscriptionAdminDto,['']) {}
