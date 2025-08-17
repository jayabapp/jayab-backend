import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import {
  _IsInt,
  _Max,
  _Min,
  _IsBoolean,
  _IsArray,
  _IsString,
  _IsNotEmpty,
  _IsNumberString,
  _IsIn,
} from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyUserDto extends PaginationCursorDto {
  @ApiProperty({ title: 'سرچ', required: false })
  @_IsString()
  @IsOptional()
  q?: string;

  @ApiProperty({ title: 'کد', required: false })
  @_IsNumberString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false, title: 'استان' })
  @IsOptional()
  @Type(() => Number)
  province_id?: number;

  @ApiProperty({ required: false, example: 'villa,ramsar,pool' }) //کلیدهای موجود در آدرس
  @_IsString()
  @IsOptional()
  keys?: string;

  @ApiProperty({ required: false, title: 'شهر', example: '147,2' })
  @_IsString()
  @IsOptional()
  cities?: string;

  @ApiProperty({ required: false, title: 'محله' })
  @IsOptional()
  @IsNumber({}, { each: true })
  regions?: number[];

  @ApiProperty({ required: false, title: 'تعداد خواب' })
  @Type(() => Number)
  @_IsInt()
  @_Max(20)
  @_Min(0)
  @IsOptional()
  total_bedrooms?: number;

  @ApiProperty({ required: false, title: 'تعداد نفرات' })
  @Type(() => Number)
  @_IsInt()
  @_Max(100)
  @_Min(0)
  @IsOptional()
  total_guests?: number;

  @ApiProperty({ required: false, title: 'نوع ملک' })
  @_IsString()
  @IsOptional()
  property_type?: string;

  @ApiProperty({ required: false, title: 'نوع بافت' })
  @_IsString()
  @IsOptional()
  pattern?: string;

  @ApiProperty({ required: false, title: 'تهویه' })
  @_IsString()
  @IsOptional()
  cool_heat?: string;

  @ApiProperty({ required: false, title: '' })
  @_IsString()
  @IsOptional()
  welfare?: string;

  @ApiProperty({ required: false, title: '' })
  @_IsString()
  @IsOptional()
  neighborhood?: string;

  @ApiProperty({ required: false, title: '' })
  @_IsString()
  @IsOptional()
  kitchen?: string;

  @ApiProperty({ required: false, title: '' })
  @_IsString()
  @IsOptional()
  guest_type?: string;

  @ApiProperty({ required: false, title: '', example: '68,69' })
  @_IsString()
  @IsOptional()
  party?: string;

  @ApiProperty({ type: String, required: false, title: 'استخر', example: 29 })
  @_IsString()
  @IsOptional()
  pool_type?: string;

  @ApiProperty({ required: false, title: 'تفریحی' })
  @_IsString()
  @IsOptional()
  entertainment?: string;

  @ApiProperty({ required: false, title: 'فقط استخردار' })
  @Type(() => Number)
  @_IsIn([0, 1, 2])
  @IsOptional()
  has_pool?: number;

  @ApiProperty({ required: false, title: 'فقط استخردار' })
  @Type(() => Number)
  @_IsIn([0, 1])
  @IsOptional()
  has_discount?: number;

  @ApiProperty({ required: false, title: 'ملک های ویژه' })
  @Type(() => Number)
  @_IsIn([0, 1])
  @IsOptional()
  is_premium?: number;

  @ApiProperty({ required: false, title: 'اسم ملک' })
  @_IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, title: 'از قیمت' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  min_price?: number;

  @ApiProperty({ required: false, title: 'تا قیمت' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  max_price?: number;

  @ApiProperty({ required: false, title: 'محبوب ترین ها' })
  @_IsString()
  @IsOptional()
  sort_type?: 'popular' | 'newset' | 'price_asc' | 'price_desc' | 'commission_desc';

  @ApiProperty({ required: false, title: 'از قیمت' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  min_building_area?: number;

  @ApiProperty({ required: false, title: 'تا قیمت' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  max_building_area?: number;

  @ApiProperty({ required: false, title: 'از کمیسیون' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  min_commission?: number;

  @ApiProperty({ required: false, title: 'تا کمیسیون' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  max_commission?: number;

  @ApiProperty({ required: false, title: 'از تاریخ' })
  @Type(() => Date)
  @IsOptional()
  checkin?: Date;

  @ApiProperty({ required: false, title: 'تا تاریخ' })
  @Type(() => Date)
  @IsOptional()
  checkout?: Date;
}

export class PropertySearchSuggestuibUserDto {
  @ApiProperty({ required: true, title: '' })
  @_IsString()
  @_IsNotEmpty()
  q: string;
}
