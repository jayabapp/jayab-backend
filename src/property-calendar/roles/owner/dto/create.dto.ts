import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _MaxLength,
  _Max,
  _Min,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { JalaaliDateDto } from 'src/common/dto/jalaali-date.dto';
import { IsPrice } from 'src/common/validators/price-validator.decorator';
import { normalizePropertyPrice } from 'src/property/common/normalize-price.helper';
import { RentType } from 'src/property/common/types/property-rent-types.type';

export class CreatePropertyCalendarNoteOwnerDto extends JalaaliDateDto {
  @ApiProperty({ required: true, title: 'توضیحات', example: 'توضیحات' })
  @_IsString()
  @_MaxLength(1000)
  @IsOptional()
  note: string;
}

export class UpdatePropertyReservedStatusOwnerDto extends JalaaliDateDto {}

//also is in update property steps
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
