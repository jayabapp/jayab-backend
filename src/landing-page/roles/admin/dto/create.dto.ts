import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _IsArray,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreateLandingPageAdminDto {
  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, default: 1 })
  @Validate(IsExist, ['content', 'id'])
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  main_content_id: number;

  // @ApiProperty({ required: false, default: 1 })
  // @_IsArray()
  // @IsOptional()
  // related_contents: number[];

  @ApiProperty({ required: false, default: 1 })
  @_IsArray()
  @IsOptional()
  related_landings: number[];

  @ApiProperty({ required: true, default: '' })
  @Transform(({ value }) => value?.replace(/s\+/g, ''))
  @_IsString()
  @_IsNotEmpty()
  url: string;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  is_active: boolean;

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  show_in_home: boolean;

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @IsOptional()
  options: number[];

  @ApiProperty({ required: false, default: 1 })
  @Validate(IsExist, ['city', 'id'])
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  province_id: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsArray()
  @IsOptional()
  cities: number[];

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  has_pool: boolean;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_type: number;

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  min_discount_percentage: number;

  @ApiProperty({ required: true, default: false })
  @_IsBoolean()
  @IsOptional()
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

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  image_id: number;

  @ApiProperty({ required: false, default: null })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  sort_order: number;
}
