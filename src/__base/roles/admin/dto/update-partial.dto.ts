import { PickType } from '@nestjs/mapped-types';
import { CreateBaseAdminDto } from './create.dto';

export class UpdatePartialBaseAdminDto {}
// export class UpdatePartialBaseAdminDto extends PickType(CreateBaseAdminDto,['']) {}
