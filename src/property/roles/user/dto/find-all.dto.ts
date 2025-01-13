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
} from 'src/common/pipes/validator-translate.pipe';
import { RentType } from 'src/property/common/types/property-rent-types.type';

export class FindAllPropertyUserDto extends PaginationCursorDto {
  @ApiProperty({ title: 'کد', required: false })
  @_IsNumberString()
  @IsOptional()
  code?: string;

  @ApiProperty({ required: false, title: 'استان' })
  @IsOptional()
  @Type(() => Number)
  // @Validate(IsExist, ['city', 'id'])
  province_id?: number;

  @ApiProperty({ required: false, title: 'شهر' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { each: true })
  cities?: number[];

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

  @ApiProperty({ required: false, title: 'نوع ملک' })
  @Type(() => Number)
  @IsOptional()
  @_IsInt()
  // @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.PROPERTY_TYPE])
  property_type?: number;

  @ApiProperty({ required: false, title: 'فقط استخردار' })
  @Transform(({ value }) => {
    if (value == 'true') return true;
    else if (value == 'false') return false;
    else return undefined;
  })
  @IsOptional()
  @_IsBoolean()
  with_pool?: boolean;

  @ApiProperty({ required: false, title: 'استخر' })
  @Type(() => Number)
  // @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.POOL_TYPE])
  @IsOptional()
  pool_type?: number[];

  @ApiProperty({ required: false, title: 'تفریحی' })
  @Type(() => Number)
  @IsOptional()
  // @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.ENTERTAINMENT])
  entertainment?: number[];

  @ApiProperty({ required: false, title: 'نوع اجاره' })
  @_IsArray()
  @IsEnum(RentType, { each: true })
  @IsOptional()
  rent_type?: RentType[];

  @ApiProperty({ required: false, title: 'اسم ملک' })
  @_IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ required: false, title: 'تاریخ شروع' })
  // @IsObject()
  // @ValidateNested()
  // @Type(() => DayDto)
  @IsOptional()
  start_day?: string;

  @ApiProperty({ required: false, title: 'تاریخ شروع' })
  @Type(() => Number)
  @ValidateIf((obj) => Boolean(obj.start_day))
  @_IsInt()
  @_Min(1)
  @_Max(30)
  @IsOptional()
  num_days?: number;

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
}
