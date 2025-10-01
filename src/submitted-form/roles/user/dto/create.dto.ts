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
  _MaxLength,
  _MinLength,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { FormBuilderInputType } from 'src/form-builder/common/form-builder-input-type.enum';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { TextInputValidator, TextInputValidatorType } from 'src/common/validators/text-input.validator';

export class FormItemDto {
  @ApiProperty({ required: true, example: 'عنوان' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 'لورم ایپسوم' })
  @_IsString()
  @_IsNotEmpty()
  value: string;

  @ApiProperty({ required: false, example: null })
  @_IsArray()
  @IsOptional()
  images: number[];

  @ApiProperty({ enum: FormBuilderInputType, required: true, example: FormBuilderInputType.INPUT })
  @_IsEnum(FormBuilderInputType)
  @_IsNotEmpty()
  type: FormBuilderInputType;
}

export class SubmitFormItemDto {
  @ApiProperty({ type: [FormItemDto], required: true, example: FormItemDto })
  @_ArrayNotEmpty()
  @Type(() => FormItemDto)
  items: FormItemDto[];
}

export class CreateSubmittedFormUserDto extends SubmitFormItemDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  content_id: number;

  @ApiProperty({ required: false, example: '09120000000' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_MaxLength(64)
  @_MinLength(1)
  @_IsString()
  @IsOptional()
  full_name: string;
}
