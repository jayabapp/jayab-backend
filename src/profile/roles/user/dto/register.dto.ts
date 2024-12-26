import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _Min,
  _Length,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { IsNationalId } from 'src/common/validators/national-code.validator';

export class RegisterOwnerUserDto {
  @ApiProperty({ required: true, default: 'کاربر تست' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;

  @ApiProperty({ required: true, default: '0603400000' })
  @Validate(IsNationalId)
  national_code: string;

  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  selfie_image_id: number;
}
