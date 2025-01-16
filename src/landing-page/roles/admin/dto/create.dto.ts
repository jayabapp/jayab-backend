import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreateLandingPageAdminDto {
  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  content_category_id: number;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  url: string;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  show_in_home: boolean;

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @IsOptional()
  options: number[];

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  province_id: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  city_id: number;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  has_pool: boolean;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_type: number;

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  min_discount_percentage: number;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_premium: boolean;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  min_price: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  max_price: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  min_bedroom: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  max_bedroom: number;
}
