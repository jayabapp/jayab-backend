import { ApiProperty } from '@nestjs/swagger';
import { IsAlpha } from 'class-validator';
import { _IsString, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { CreateContentCategoryAdminDto } from './create.dto';
import { Transform } from 'class-transformer';

export class UpdateContentCategoryAdminDto extends CreateContentCategoryAdminDto {}

export class UpdateContentCategoryDynamicFieldsAdminDto {
  @ApiProperty({ required: true, default: 'قوانین' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, default: 'terms' })
  @_IsString()
  @IsAlpha()
  @Transform(({ value }) => value?.replace(/ /g, ''))
  @_IsNotEmpty()
  key: string;

  @ApiProperty({ required: true, default: 'type' })
  @_IsString()
  @IsAlpha()
  @Transform(({ value }) => value?.replace(/ /g, ''))
  @_IsNotEmpty()
  type: 'text' | 'number' | 'select';
}
