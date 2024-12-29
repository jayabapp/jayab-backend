import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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
  @ApiProperty({ required: true, default: 'عنوان' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, default: 'توضیحات' })
  @_Length(0, 256)
  @_IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ required: true })
  @_IsEnum(PropertyOptionGroup)
  @_IsNotEmpty()
  group: PropertyOptionGroup;

  @ApiProperty({ default: 'ترتیب' })
  @_IsInt()
  @Transform(({ value }) => value || 0)
  @IsOptional()
  sort?: number;
}
