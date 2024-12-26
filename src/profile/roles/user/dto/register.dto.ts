import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _Min,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class RegisterOwnerUserDto {
  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  national_code: string;

  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  selfie_image_id: number;
}
