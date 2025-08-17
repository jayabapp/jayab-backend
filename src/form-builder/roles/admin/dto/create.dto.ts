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
  @ApiProperty({ enum: FormBuilderInputType, required: true, example: FormBuilderInputType.INPUT })
  @_IsEnum(FormBuilderInputType)
  @_IsNotEmpty()
  type: FormBuilderInputType;

  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 1 })
  @Validate(IsExist, ['content', 'id'])
  @_IsInt()
  @_Min(1)
  @_IsNotEmpty()
  content_id: number;

  @ApiProperty({ required: true, example: ['ایتم یک'] })
  @Transform((data) => {
    if ([FormBuilderInputType.SELECT, FormBuilderInputType.MULTI_SELECT].includes(data.obj?.type))
      return data.value;
    else return [];
  })
  @_IsNotEmpty()
  options: string[];

  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  key: string;

  @ApiProperty({ required: false, example: null })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  sort_order: number;

  @ApiProperty({ required: false, example: false })
  @_IsBoolean()
  @_IsNotEmpty()
  is_mandatory: boolean;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  description: string;
}
