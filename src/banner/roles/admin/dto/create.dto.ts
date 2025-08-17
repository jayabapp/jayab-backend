import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsBoolean,
  _IsEnum,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { BannerPosition } from 'src/banner/common/banner-positions.constant';

export class CreateBannerAdminDto {
  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 1 })
  @Validate(IsExist, ['property', 'id'])
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_id: number;

  @ApiProperty({ enum: BannerPosition, required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsEnum(BannerPosition)
  @_IsNotEmpty()
  position: BannerPosition;

  @ApiProperty({ required: true, example: true })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  link: string;

  @ApiProperty({ required: true, example: 1 })
  @Validate(IsExist, ['attachment', 'id'])
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  image_id: number;

  @ApiProperty({ required: false, example: 1 })
  @Validate(IsExist, ['attachment', 'id'])
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  image_sm_id: number;

  @ApiProperty({ required: false, example: null })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  sort_order: number;
}
