import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Validate } from 'class-validator';
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

export class RegisterAdvisorUserDto {
  @ApiProperty({ required: true, default: 'کاربر تست' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;

  @ApiProperty({ required: true, default: 'آدرس تست' })
  @_Length(1, 512)
  @_IsString()
  @_IsNotEmpty()
  address: string;

  @ApiProperty({ default: '0603400000', required: true })
  @Validate(IsNationalId)
  national_code: string;

  @ApiProperty({ description: 'tel number without zero', default: '12345678' })
  @_MaxLength(8)
  @_IsNumberString()
  @IsOptional()
  tel: string;

  @ApiProperty({ default: '021' })
  @_IsNumberString()
  @_MaxLength(3)
  @IsOptional()
  area_code: string;

  @ApiProperty({ required: true, default: [1] })
  @_IsArray()
  @IsNumber({}, { each: true })
  @_IsNotEmpty()
  cityIds: number[];

  @ApiProperty({ required: true, default: false })
  @_IsBoolean()
  @_IsNotEmpty()
  is_special: boolean;

  /* -------------------------------------------------------------------------- */
  // images
  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  profile_image_id: number;

  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  national_card_image_id: number;

  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  document_image_id: number;
}
