import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { _IsDate, _IsInt, _IsNotEmpty, _Max, _Min } from 'src/common/pipes/validator-translate.pipe';

export class PropertyQuoteUserDto {
  @ApiProperty({ required: true, example: '2026-10-06T00:00:00.000Z' })
  @_IsDate()
  @Type(() => Date)
  @_IsNotEmpty()
  check_in: Date;

  @ApiProperty({ required: true, example: '2026-10-08T00:00:00.000Z' })
  @_IsDate()
  @Type(() => Date)
  @_IsNotEmpty()
  check_out: Date;

  @ApiProperty({ required: true, example: 2 })
  @_IsInt()
  @Type(() => Number)
  @_Min(1)
  @_Max(50)
  guests: number;
}

export type PropertyQuoteNightBreakdown = {
  date: string;
  day_column: string;
  base_price: number;
  final_price: number;
  is_discounted: boolean;
  is_peak: boolean;
};

export type PropertyQuoteResType = {
  property_id: number;
  check_in: string;
  check_out: string;
  nights: number;
  guests: number;
  is_available: boolean;
  unavailable_dates: string[];
  nights_breakdown: PropertyQuoteNightBreakdown[];
  rent_total: number;
  discount_total: number;
  std_capacity: number;
  max_capacity: number;
  extra_guests: number;
  extra_guest_fee_per_night: number;
  extra_guest_total: number;
  cleaning_fee: number;
  total: number;
  canceling_type: { id: string; title: string } | null;
};
