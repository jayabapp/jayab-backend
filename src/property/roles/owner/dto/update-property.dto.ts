import { ApiProperty } from '@nestjs/swagger';
// import { CANCELING_TYPE, PropertyOptionGroup, RentType } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  Validate,
  IsObject,
  ValidateNested,
  ValidateIf,
  IsOptional,
  ArrayMaxSize,
  Max,
  ArrayUnique,
  IsEnum,
  ArrayContains,
} from 'class-validator';
import {
  _ArrayMaxSize,
  _ArrayMinSize,
  _ArrayNotEmpty,
  _IsArray,
  _IsBoolean,
  _IsEnum,
  _IsInt,
  _IsLatitude,
  _IsLongitude,
  _IsNotEmpty,
  _IsNumber,
  _IsNumberString,
  _IsString,
  _Length,
  _Max,
  _MaxLength,
  _Min,
  _MinLength,
} from 'src/common/pipes/validator-translate.pipe';
import moment from 'moment-jalaali';
import { IsCorrectPropertyOption } from 'src/common/validators/is-correct-prop-opts.validator';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { PropertyOptionGroup } from 'src/property-option/common/property-option-groups.type';
import { RentType } from 'src/property/common/types/property-rent-types.type';
import { normalizePropertyPrice } from 'src/property/common/normalize-price.helper';
import { IsPrice } from 'src/common/validators/price-validator.decorator';
import { CancelingType } from 'src/property/common/types/property-canceling-types.type';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';

export class DayDto {
  @_IsNotEmpty()
  @_IsInt()
  @_Min(1)
  @_Max(31)
  day: number;

  @_IsNotEmpty()
  @_IsInt()
  @_Min(1)
  @_Max(12)
  month: number;

  @_IsNotEmpty()
  @_IsInt()
  @_Min(1401)
  @_Max(1410)
  year: number;
}

export class UpdatePropertyStepOneOwnerDto {
  @ApiProperty({ required: true, title: 'نوع ملک', default: 7 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.PROPERTY_TYPE])
  @_IsNotEmpty()
  property_type: number;

  @ApiProperty({ required: true, title: 'اسم ملک', default: 'ویلا کردان یک' })
  @_IsString()
  @_MaxLength(100)
  @_MinLength(2)
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, title: 'متراژ زمین', default: 1000 })
  @_IsInt()
  @_Max(100000)
  @_Min(0)
  @_IsNotEmpty()
  land_area: number;

  @ApiProperty({ required: true, title: 'متراژ زیربنا', default: 120 })
  @_IsInt()
  @_Max(100000)
  @_Min(10)
  @_IsNotEmpty()
  building_area: number;

  @ApiProperty({ required: true, title: 'طبقات', default: 1 })
  @Transform(({ value }) => {
    if (value) return value;
    else return 1;
  })
  @_IsInt()
  @_Max(20)
  @_Min(1)
  @IsOptional()
  floors: number;

  @ApiProperty({ required: true, title: 'طبقه', default: 0 })
  @Transform(({ value }) => {
    if (value) return value;
    else return 0;
  })
  @_IsInt()
  @_Max(20)
  @_Min(0)
  @IsOptional()
  floor: number;

  @ApiProperty({ required: true, title: 'تعداد واحد در طبقه', default: 1 })
  @Transform(({ value }) => {
    if (value) return value;
    else return 1;
  })
  @_IsInt()
  @_Max(10)
  @_Min(1)
  @IsOptional()
  unit_per_floor: number;

  @ApiProperty({ required: true, title: 'سال ساخت', default: 1390 })
  @_IsInt()
  @_Max(moment().jYear())
  @_Min(1300)
  @_IsNotEmpty()
  construction_year: number;

  @ApiProperty({ required: true, title: 'جهت ساختمان', default: 25 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.BUILDING_DIRECTION])
  @_IsNotEmpty()
  building_direction: number;

  @ApiProperty({ required: true, title: 'نوع مالکیت', default: 26 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.OWNERSHIP])
  @_IsNotEmpty()
  ownership: number;

  // @ApiProperty({ required: true, title: 'کشور' })
  // @_IsInt()
  // @Validate(IsExist, ['city', 'id'])
  // @_IsNotEmpty()
  // country_id: number;

  @ApiProperty({ required: true, title: 'استان', default: 5 })
  @_IsInt()
  @Validate(IsExist, ['city', 'id', { parent_id: null }])
  @_IsNotEmpty()
  province_id: number;

  @ApiProperty({ required: true, title: 'شهر', default: 147 })
  @_IsInt()
  @Validate(IsExist, ['city', 'id', { parent_id: { not: null } }])
  @_IsNotEmpty()
  city_id: number;

  @ApiProperty({ title: 'محله' })
  @_IsInt()
  @Validate(IsExist, ['city', 'id', { parent_id: { not: null } }])
  @IsOptional()
  region_id: number;

  @ApiProperty({ required: true, title: 'آدرس', default: 'آدرس تست تست آدرس تست' })
  @_IsString()
  @_MaxLength(200)
  @_MinLength(5)
  @_IsNotEmpty()
  address: string;

  @ApiProperty({ required: true, default: false })
  @_IsBoolean()
  @IsOptional()
  is_chat_enabled = false;

  @ApiProperty({ required: true, default: false })
  @_IsBoolean()
  @IsOptional()
  is_location_visible = false;
}

export class UpdatePropertyLocationOwnerDto {
  @ApiProperty({ required: true, title: 'عرض جغرافیایی', default: 35.771329 })
  @_IsNumber()
  @_IsLatitude()
  @_IsNotEmpty()
  lat: number;

  @ApiProperty({ required: true, title: 'طول جغرافیایی', default: 51.377648 })
  @_IsNumber()
  @_IsLongitude()
  @_IsNotEmpty()
  lng: number;
}

export class UpdatePropertyMediaOwnerDto {
  @ApiProperty({ required: true, title: 'تصاویر', default: [1] })
  @_ArrayMaxSize(30)
  // @_ArrayMinSize(4) //TODO:uncomment
  @IsNumber({}, { each: true })
  @_ArrayNotEmpty()
  images: number[];

  @ApiProperty({ required: true, default: 1 })
  @_Min(1)
  @_IsInt()
  @_IsNotEmpty()
  feature_image_id: number;

  // @ApiProperty({ required: true, title: 'ویدیو' })
  // @_IsInt()
  // @IsOptional()
  // video_id: number;
}

export class UpdatePropertyEnvOwnerDto {
  @ApiProperty({ required: true, title: 'بافت محیط', default: 11 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.PATTERN])
  @_IsNotEmpty()
  pattern: number;

  @ApiProperty({ required: true, title: 'مسیر دسترسی', default: 10 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.ACCESS])
  @IsOptional()
  access: number;

  @ApiProperty({ required: true, title: 'همسایگی', default: 14 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.NEIGHBORHOOD])
  @IsOptional()
  neighborhood: number;

  @ApiProperty({ title: 'توضیحات بافت' })
  @_IsString()
  @_MaxLength(200)
  @IsOptional()
  pattern_dscr: string;

  @ApiProperty({ title: 'توضیحات فاصله' })
  @_IsString()
  @_MaxLength(200)
  @IsOptional()
  distance_dscr: string;
}

export class UpdatePropertyBedroomOwnerDto {
  @ApiProperty({ required: true, title: 'تعداد اتاق', default: [1, 2] })
  @_IsArray()
  @IsNumber({}, { each: true })
  @Max(10, { each: true })
  @_IsNotEmpty()
  bedrooms: number[];

  @ApiProperty({ required: true, title: 'رخت خواب اضافه' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @_IsNotEmpty()
  additional_bed: number;

  @ApiProperty({ required: true, title: 'اتاق خواب مستر' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @_IsNotEmpty()
  master_room: number;

  @ApiProperty({ required: true, title: 'مبل تخت خواب شو' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @_IsNotEmpty()
  sofa_bed: number;

  @ApiProperty({ title: 'سرویس فرنگی' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @IsOptional()
  wc: number;

  @ApiProperty({ title: 'ایرانی' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @IsOptional()
  wc_ir: number;

  @ApiProperty({ title: 'حمام در اتاق' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @IsOptional()
  bathroom_master: number;

  @ApiProperty({ title: 'مشترک' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @IsOptional()
  bathroom_general: number;

  @ApiProperty({ title: '' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @IsOptional()
  bathroom_in_wc: number;

  @ApiProperty({ title: 'حمام با وان' })
  @_IsInt()
  @_Min(0)
  @_Max(10)
  @IsOptional()
  bathroom_tub: number;
}

export class UpdatePropertyFacilityOwnerDto {
  @ApiProperty({ required: true, title: 'سرمایش', default: [17] })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.COOL_HEAT])
  @_ArrayNotEmpty()
  cool_heat: number[];

  @ApiProperty({ required: true, title: 'رفاهی', default: [19] })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.WELFARE])
  // @_ArrayNotEmpty()
  @IsOptional()
  welfare: number[];

  @ApiProperty({ required: true, title: 'تفریحی', default: [1, 2] })
  // @_ArrayNotEmpty()
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.ENTERTAINMENT])
  @IsOptional()
  entertainment: number[];

  @ApiProperty({ required: true, title: 'آشپزخانه', default: [15] })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.KITCHEN])
  // @_ArrayNotEmpty()
  @IsOptional()
  kitchen: number[];

  @ApiProperty({ required: true, title: 'استخر دارد؟', default: true })
  @_IsBoolean()
  @_IsNotEmpty()
  has_pool: boolean;

  @ApiProperty({ required: true, title: 'استخر', default: [29] })
  @ValidateIf((e) => e.has_pool == true)
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.POOL_TYPE])
  @Transform((params) => {
    if (!params.obj.has_pool) return [];
    else return params.value;
  })
  @_ArrayNotEmpty()
  pool_type: number[];

  @ApiProperty({ title: 'توضیحات امکانات' })
  @_IsString()
  @_MaxLength(200)
  @IsOptional()
  facility_dscr: string;
}

export class UpdatePropertyPriceOwnerDto {
  @ApiProperty({ required: true, title: 'ظرفیت', default: 2 })
  @_IsInt()
  @_Max(100)
  @_Min(1)
  @_IsNotEmpty()
  std_capacity: number;

  @ApiProperty({ required: true, title: 'ظرفیت حداکثر', default: 6 })
  @_IsInt()
  @_Max(100)
  @_Min(1)
  @_IsNotEmpty()
  max_capacity: number;

  @ApiProperty({ required: true, title: 'کمیسیون مشاور', default: 5 })
  @_IsInt()
  @_Max(50)
  @_Min(0)
  @_IsNotEmpty()
  advisor_commission: number;

  // @ApiProperty({ enum: RentType, required: true, title: 'نوع اجاره', default: [RentType.DAILY] })
  // // @Transform(({ value }) => value.map(e=> e.toUpperCase()))
  // @_IsArray()
  // @IsEnum(RentType, { each: true })
  // @ArrayContains([RentType.DAILY])
  // @_IsNotEmpty()
  // rent_type: RentType[];

  //DAILY
  @ApiProperty({ required: true, title: 'عادی', default: 1000000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice, [RentType.DAILY])
  @_IsNotEmpty()
  normal: number;

  @ApiProperty({ required: true, title: 'چهارشنبه', default: 1500000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice, [RentType.DAILY])
  @_IsNotEmpty()
  wednesday: number;

  @ApiProperty({ required: true, title: 'پنج شنبه', default: 2500000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice, [RentType.DAILY])
  @_IsNotEmpty()
  thursday: number;

  @ApiProperty({ required: true, title: 'جمعه', default: 2000000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice, [RentType.DAILY])
  @_IsNotEmpty()
  friday: number;

  @ApiProperty({ required: true, title: 'ایام پیک', default: 3000000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice, [RentType.DAILY])
  @_IsNotEmpty()
  peak: number;

  @ApiProperty({ required: true, title: 'هزینه نظافت', default: 200000 })
  @Transform(({ value }) => {
    if (value) return normalizePropertyPrice(value, true);
    else return 0;
  })
  @Validate(IsPrice, [RentType.DAILY, 5000000, 0])
  @_IsNotEmpty()
  cleaning: number;

  @ApiProperty({ required: true, title: 'نفر اضافه و سه سال به بالا', default: 200000 })
  @Transform(({ value }) => {
    if (value) return normalizePropertyPrice(value, true);
    else return 0;
  })
  @Validate(IsPrice, [RentType.DAILY, 5000000, 0])
  @_IsNotEmpty()
  additional_person: number;
}

export class UpdatePropertyTermsOwnerDto {
  @ApiProperty({ required: true, default: [4] })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.GUEST_TYPE])
  @_ArrayNotEmpty()
  guest_type: number[];

  @ApiProperty({ required: true, default: 21 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.PET])
  @_IsNotEmpty()
  pet: number;

  @ApiProperty({ required: true, default: 23 })
  @Validate(IsCorrectPropertyOption, [PropertyOptionGroup.PARTY])
  @_IsNotEmpty()
  party: number;

  @ApiProperty({ required: true, enum: CancelingType })
  @_IsEnum(CancelingType)
  @Transform(({ value }) => value?.toUpperCase())
  @_IsNotEmpty()
  canceling_type: CancelingType;

  @ApiProperty({ required: true, default: 14 })
  @_Max(24)
  @_Min(1)
  @Type(() => Number)
  @_IsNotEmpty()
  check_in_hour: number;

  @ApiProperty({ required: true, default: 12 })
  @_Max(24)
  @_Min(1)
  @Type(() => Number)
  @_IsNotEmpty()
  check_out_hour: number;

  @ApiProperty({ title: 'توضیحات', default: 'توضیحات تستی' })
  @_IsString()
  @_MaxLength(800)
  @IsOptional()
  guest_dscr: string;

  @ApiProperty({ title: 'توضیحات', default: 'توضیحات تستی' })
  @_IsString()
  @_MaxLength(800)
  @IsOptional()
  pet_dscr: string;

  @ApiProperty({ title: 'توضیحات', default: 'توضیحات تستی' })
  @_IsString()
  @_MaxLength(800)
  @IsOptional()
  party_dscr: string;

  @ApiProperty({ title: 'توضیحات', default: 'توضیحات تستی' })
  @_IsString()
  @_MaxLength(800)
  @IsOptional()
  doc_dscr: string;

  @ApiProperty({ title: 'توضیحات', default: 'توضیحات تستی' })
  @_IsString()
  @_MaxLength(800)
  @IsOptional()
  other_dscr: string;

  @ApiProperty({ title: 'توضیحات تبلیغاتی', default: 'توضیحات تستی' })
  @_IsString()
  @_MaxLength(800)
  @IsOptional()
  ad_dscr: string;

  @ApiProperty({ title: 'توضیحات ملک', default: 'توضیحات تستی' })
  @_IsString()
  @_MaxLength(1000)
  @IsOptional()
  property_dscr: string;
}

export class UpdatePropertyOwnerAssistantOwnerDto {
  @ApiProperty({ required: true, default: 'نام تستی' })
  @_Length(1, 128)
  @_IsString()
  @IsOptional()
  assistant_full_name: string;

  @ApiProperty({ required: true, default: '09120000000' })
  @_IsNumberString()
  @Validate(IsMobileNumber)
  @IsOptional()
  assistant_mobile: string;

  @ApiProperty({ required: true, enum: [1, 2, 4], default: 1 })
  @_IsEnum([1, 2, 3])
  @_IsInt()
  @_IsNotEmpty()
  show_mobile_type: number;
}

export class UpdatePropertyCommissionOwnerDto {
  @ApiProperty({ required: true, title: 'کمیسیون مشاور', default: 5 })
  @_IsInt()
  @_Max(50)
  @_Min(0)
  @_IsNotEmpty()
  advisor_commission: number;
}
