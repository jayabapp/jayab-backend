import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { Validate, IsOptional } from 'class-validator';
import {
  _MinLength,
  _MaxLength,
  _IsString,
  _IsNotEmpty,
  _IsInt,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateCategoryAdminDto {
  @ApiProperty({ required: true, default: 'عنوان تست' })
  @_MinLength(1)
  @_MaxLength(50)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, title: 'عکس', default: 1 })
  @Transform(({ value }) => {
    if (!value) return null;
    return value;
  })
  @_IsInt()
  @Validate(IsExist, ['attachment', 'id'])
  @IsOptional()
  image_id: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @IsOptional()
  parent_id: number;

  @ApiProperty({ required: true, default: true })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean;

  @ApiProperty({ required: false, default: false })
  @_IsBoolean()
  @_IsNotEmpty()
  is_feature_category: boolean;

  @ApiProperty({ required: false, default: null })
  @_IsInt()
  @IsOptional()
  sort_order: number;

  @ApiProperty({ required: false, default: null })
  @_IsString()
  @IsOptional()
  hex_color: string;
}
