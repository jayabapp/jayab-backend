import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsBoolean,
  _Min,
  _IsEnum,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { FormBuilderInputType } from 'src/form-builder/common/form-builder-input-type.enum';

export class CreateFormBuilderAdminDto {
  @ApiProperty({ enum: FormBuilderInputType, required: true, default: FormBuilderInputType.INPUT })
  @_IsEnum(FormBuilderInputType)
  @_IsNotEmpty()
  type: FormBuilderInputType;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, default: 1 })
  @Validate(IsExist, ['content', 'id'])
  @_IsInt()
  @_Min(1)
  @_IsNotEmpty()
  content_id: number;

  @ApiProperty({ required: true, default: ['ایتم یک'] })
  @Transform((data) => {
    if ([FormBuilderInputType.SELECT, FormBuilderInputType.MULTI_SELECT].includes(data.obj?.type))
      return data.value;
    else return [];
  })
  @_IsNotEmpty()
  options: string[];

  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  key: string;

  @ApiProperty({ required: false, default: null })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  sort_order: number;

  @ApiProperty({ required: false, default: false })
  @_IsBoolean()
  @_IsNotEmpty()
  is_mandatory: boolean;

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  description: string;
}
