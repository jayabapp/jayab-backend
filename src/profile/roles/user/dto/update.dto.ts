import { ApiProperty } from '@nestjs/swagger';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _Min,
  _Length,
  _IsNumberString,
  _MaxLength,
  _IsArray,
  _IsEnum,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class UpdateProfileImageUserDto {
  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  profile_image_id: number;
}
