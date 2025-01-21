import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreatePropertyAdminDto {
  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  code: string
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  owner_id: number
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  title: string
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  slug: string
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  slug_hash: string
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  land_area: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  building_area: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  floors: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  unit_per_floor: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  floor: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  construction_year: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  region_id: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  province_id: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  city_id: number
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  address: string
        

  @ApiProperty({ required: false, default: 40.456 })
  @_IsNumber()
  @Type(() => Number)
  @IsOptional()
  lat: number
        

  @ApiProperty({ required: false, default: 40.456 })
  @_IsNumber()
  @Type(() => Number)
  @IsOptional()
  lng: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  feature_image_id: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  video_id: number
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  is_chat_enabled: boolean
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  is_location_visible: boolean
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  has_pool: boolean
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  std_capacity: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  max_capacity: number
        

  @ApiProperty({ required: false, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  canceling_type: string
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  advisor_commission: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  check_in_hour: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  check_out_hour: number
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  contact_type: number
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  status: number
        

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_authorized: boolean
        

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  has_blue_tick: boolean
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  options_array: number
}