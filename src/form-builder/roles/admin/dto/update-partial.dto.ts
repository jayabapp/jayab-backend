import { PickType } from '@nestjs/mapped-types';
import { CreateFormBuilderAdminDto } from './create.dto';

export class UpdatePartialFormBuilderAdminDto extends PickType(CreateFormBuilderAdminDto, ['sort_order']) {}
