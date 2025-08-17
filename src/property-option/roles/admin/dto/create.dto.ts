import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _IsEnum,
  _Max,
  _Length,
} from 'src/common/pipes/validator-translate.pipe';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';

export class CreatePropertyOptionAdminDto {
  @ApiProperty({ required: true, example: 'عنوان' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 'توضیحات' })
  @_Length(0, 256)
  @_IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: true })
  @_IsEnum(PropertyOptionGroup)
  @_IsNotEmpty()
  group: PropertyOptionGroup;

  @ApiProperty({ example: 'ترتیب' })
  @_IsInt()
  @Transform(({ value }) => value || 0)
  @IsOptional()
  sort?: number;

  @ApiProperty({ example: 'تصویر' })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  image_id?: number;

  @ApiProperty({ required: false, example: '' })
  @_Length(0, 128)
  @_IsString()
  @IsOptional()
  key?: string;
}
