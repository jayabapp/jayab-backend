import { _ArrayNotEmpty, _IsArray } from 'src/common/pipes/validator-translate.pipe';
import { CreateContentAdminDto } from './create.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateContentAdminDto extends CreateContentAdminDto {}

export class UpdateContentProductCategoryAdminDto {
  @ApiProperty({ required: true, example: [] })
  @_IsArray()
  categories: Array<number>;
}
