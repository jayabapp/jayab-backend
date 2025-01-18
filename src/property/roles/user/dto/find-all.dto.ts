import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, ValidateIf } from 'class-validator';
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
import { RentType } from 'src/property/common/types/property-rent-types.type';

export class FindAllPropertyUserDto extends PaginationCursorDto {
  @ApiProperty({ title: 'کد', required: false })
  @_IsNumberString()
  @IsOptional()
  code: string;

  @ApiProperty({ required: false, title: 'استان' })
  @IsOptional()
  @Type(() => Number)
  province_id: number;

  @ApiProperty({ isArray: false, required: false, title: 'شهر', default: '147,2' })
  @_IsString()
  @IsOptional()
  cities: string;

  @ApiProperty({ required: false, title: 'محله' })
  @IsOptional()
  @IsNumber({}, { each: true })
  regions: number[];

  @ApiProperty({ required: false, title: 'تعداد خواب' })
  @Type(() => Number)
  @_IsInt()
  @_Max(20)
  @_Min(0)
  @IsOptional()
  total_bedrooms: number;

  @ApiProperty({ required: false, title: 'تعداد نفرات' })
  @Type(() => Number)
  @_IsInt()
  @_Max(100)
  @_Min(0)
  @IsOptional()
  total_guests: number;

  @ApiProperty({ required: false, title: 'نوع ملک' })
  @Type(() => Number)
  @IsOptional()
  @_IsInt()
  property_type: number;

  @ApiProperty({ required: false, title: 'فقط استخردار' })
  @Type(() => Number)
  @_IsIn([0, 1])
  @IsOptional()
  with_pool: number;

  @ApiProperty({ type: String, required: false, title: 'استخر', default: 29 })
  @_IsString()
  @IsOptional()
  pool_type?: string;

  @ApiProperty({ required: false, title: 'تفریحی' })
  @_IsString()
  @IsOptional()
  entertainment: string;

  @ApiProperty({ required: false, title: 'ملک های ویژه' })
  @Type(() => Number)
  @_IsIn([0, 1])
  @IsOptional()
  is_premium: number;

  // @ApiProperty({ required: false, title: 'نوع اجاره' })
  // @Transform(({ value }) => {
  //   if (!value) return null;
  //   return value?.split(',')?.map((e) => +e);
  // })
  // @_IsString()
  // @IsOptional()
  // rent_type: RentType[];

  @ApiProperty({ required: false, title: 'اسم ملک' })
  @_IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ required: false, title: 'تاریخ شروع' })
  // @IsObject()
  // @ValidateNested()
  // @Type(() => DayDto)
  @IsOptional()
  start_day: string;

  @ApiProperty({ required: false, title: 'تاریخ شروع' })
  @Type(() => Number)
  @ValidateIf((obj) => Boolean(obj.start_day))
  @_IsInt()
  @_Min(1)
  @_Max(30)
  @_IsNotEmpty()
  num_days: number;

  @ApiProperty({ required: false, title: 'از قیمت' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  min_price: number;

  @ApiProperty({ required: false, title: 'تا قیمت' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  max_price: number;
}
