import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import {
  _ArrayNotEmpty,
  _IsArray,
  _IsBoolean,
  _IsInt,
  _IsNotEmpty,
  _IsNumber,
  _IsNumberString,
  _IsString,
  _Length,
  _Max,
  _MaxLength,
  _Min,
  _MinLength,
} from 'src/common/pipes/validator-translate.pipe';
import { IsNationalId } from 'src/common/validators/national-code.validator';

export class PropertyAuthorizeto {
  @ApiProperty({ title: 'عکس کارت ملی', description: 'ای دی فایل' })
  @_IsNotEmpty()
  @_IsInt()
  nc_image_id: number;

  @ApiProperty({ title: 'اسناد ملک' })
  @_IsInt()
  @_ArrayNotEmpty()
  docs: number[];
}
