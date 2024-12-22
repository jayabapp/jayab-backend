import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _ArrayNotEmpty,
  _IsEnum,
  _IsArray,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { FormBuilderInputType } from 'src/form-builder/common/form-builder-input-type.enum';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class FormItemDto {
  @ApiProperty({ required: true, default: 'عنوان' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, default: 'لورم ایپسوم' })
  @_IsString()
  @_IsNotEmpty()
  value: string;

  @ApiProperty({ required: false, default: null })
  @_IsArray()
  @IsOptional()
  images: number[];

  @ApiProperty({ enum: FormBuilderInputType, required: true, default: FormBuilderInputType.INPUT })
  @_IsEnum(FormBuilderInputType)
  @_IsNotEmpty()
  type: FormBuilderInputType;
}

export class SubmitFormItemDto {
  @ApiProperty({ type: [FormItemDto], required: true, default: FormItemDto })
  @_ArrayNotEmpty()
  @Type(() => FormItemDto)
  items: FormItemDto[];
}

export class CreateSubmittedFormUserDto extends SubmitFormItemDto {
  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  content_id: number;

  @ApiProperty({ required: false, default: '09120000000' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  full_name: string;
}
