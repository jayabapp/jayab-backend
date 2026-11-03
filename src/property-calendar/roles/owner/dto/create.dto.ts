import { IsArray, IsOptional, Validate, ValidateNested } from 'class-validator';
import { _IsInt, _Max, _Min, _ArrayMaxSize, _ArrayMinSize } from 'src/common/pipes/validator-translate.pipe';
import { _IsNotEmpty, _IsString, _IsBoolean, _MaxLength } from 'src/common/pipes/validator-translate.pipe';
import { normalizePropertyPrice } from 'src/property/common/normalize-price.helper';
import { Transform, Type } from 'class-transformer';
import { JalaaliDateDto } from 'src/common/dto/jalaali-date.dto';
import { ApiProperty } from '@nestjs/swagger';
import { RentType } from 'src/property/common/types/property-rent-types.type';
import { IsPrice } from 'src/common/validators/price-validator.decorator';

export class CreatePropertyCalendarNoteOwnerDto extends JalaaliDateDto {
  @ApiProperty({ required: true, title: 'توضیحات', example: 'توضیحات' })
  @_IsString()
  @_MaxLength(1000)
  @IsOptional()
  note: string;
}

export class UpdatePropertyReservedStatusOwnerDto extends JalaaliDateDto {}

export class UpdatePropertyAdvisorCommissionOwnerDto extends JalaaliDateDto {
  @ApiProperty({ required: true, title: 'کمیسیون مشاور', example: 5 })
  @_IsInt()
  @_Max(50)
  @_Min(0)
  @_IsNotEmpty()
  advisor_commission: number;
}

export class UpdatePropertyDayPriceOwnerDto extends JalaaliDateDto {
  @ApiProperty({ required: true, title: 'قیمت', example: 1500000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice)
  @_IsNotEmpty()
  price: number;

  @ApiProperty({ required: false, title: 'قیمت با تخفیف', example: 1000000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice, [RentType.DAILY])
  @IsOptional()
  discounted_price: number = null;
}

/* --------------------------- CHANGING MANY DAYS --------------------------- */

export const MAX_BULK_CALENDAR_DAYS = 62;

export class BulkJalaaliDaysOwnerDto {
  @ApiProperty({ type: () => JalaaliDateDto, isArray: true, title: 'روزهای انتخاب شده', required: true })
  @Type(() => JalaaliDateDto)
  @IsArray()
  @ValidateNested({ each: true })
  @_ArrayMinSize(1)
  @_ArrayMaxSize(MAX_BULK_CALENDAR_DAYS)
  @_IsNotEmpty()
  days: JalaaliDateDto[];
}

export class BulkUpdatePropertyReservedStatusOwnerDto extends BulkJalaaliDaysOwnerDto {
  @ApiProperty({ required: true, title: 'پر یا خالی بودن روزها', example: true })
  @Type(() => Boolean)
  @_IsBoolean()
  @_IsNotEmpty()
  is_reserved: boolean;
}

export class BulkUpdatePropertyDayPriceOwnerDto extends BulkJalaaliDaysOwnerDto {
  @ApiProperty({ required: true, title: 'قیمت', example: 1500000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice)
  @_IsNotEmpty()
  price: number;

  @ApiProperty({ required: false, title: 'قیمت با تخفیف', example: 1000000 })
  @Transform((e) => normalizePropertyPrice(e.value))
  @Validate(IsPrice, [RentType.DAILY])
  @IsOptional()
  discounted_price: number = null;
}
