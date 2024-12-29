import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _Length,
  _Min,
  _Max,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsCorrectPropertyOption } from 'src/common/validators/is-correct-prop-opts.validator';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import moment from 'moment-jalaali';
import { IsExist } from 'src/common/validators/is-exists.validator';

export class CreatePropertyOwnerDto {
  @ApiProperty({ required: true, title: 'نوع ملک' })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.PROPERTY_TYPE])
  @_IsNotEmpty()
  property_type: number;

  @ApiProperty({ required: true, title: 'اسم ملک' })
  @_IsString()
  @_Length(2, 100)
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, title: 'متراژ زمین' })
  @_IsInt()
  @_Max(100000)
  @_Min(0)
  @_IsNotEmpty()
  land_area: number;

  @ApiProperty({ required: true, title: 'متراژ زیربنا' })
  @_IsInt()
  @_Max(100000)
  @_Min(10)
  @_IsNotEmpty()
  building_area: number;

  @ApiProperty({ required: true, title: 'طبقات' })
  @Transform(({ value }) => {
    if (value) return value;
    else return 1;
  })
  @_IsInt()
  @_Max(20)
  @_Min(1)
  @IsOptional()
  floors: number;

  @ApiProperty({ required: true, title: 'طبقه' })
  @Transform(({ value }) => {
    if (value) return value;
    else return 0;
  })
  @_IsInt()
  @_Max(20)
  @_Min(0)
  @IsOptional()
  floor: number;

  @ApiProperty({ required: true, title: 'تعداد واحد در طبقه' })
  @Transform(({ value }) => {
    if (value) return value;
    else return 1;
  })
  @_IsInt()
  @_Max(10)
  @_Min(1)
  @IsOptional()
  unit_per_floor: number;

  @ApiProperty({ required: true, title: 'سال ساخت' })
  @_IsInt()
  @_Max(moment().jYear())
  @_Min(1300)
  @_IsNotEmpty()
  construction_year: number;

  @ApiProperty({ required: true, title: 'جهت ساختمان' })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.BUILDING_DIRECTION])
  @_IsNotEmpty()
  building_direction: number;

  @ApiProperty({ required: true, title: 'نوع مالکیت' })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.OWNERSHIP])
  @_IsNotEmpty()
  ownership: number;

  // @ApiProperty({ required: true, title: 'کشور' })
  // @_IsInt()
  // @Validate(IsExist, ['city', 'id'])
  // @_IsNotEmpty()
  // country_id: number;

  @ApiProperty({ title: 'محله' })
  @_IsInt()
  @Validate(IsExist, ['city', 'id'])
  @IsOptional()
  region_id: number;

  @ApiProperty({ required: true, title: 'استان' })
  @_IsInt()
  @Validate(IsExist, ['city', 'id'])
  @_IsNotEmpty()
  province_id: number;

  @ApiProperty({ required: true, title: 'شهر' })
  @_IsInt()
  @Validate(IsExist, ['city', 'id'])
  @_IsNotEmpty()
  city_id: number;

  @ApiProperty({ required: true, title: 'آدرس' })
  @_IsString()
  @_Length(5, 256)
  @_IsNotEmpty()
  address: string;
}
