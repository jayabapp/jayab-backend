import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreateSubscriptionUserDto {
  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  advisor_id: number;

  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_promote: boolean;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @IsOptional()
  is_special_advisor: boolean;

  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  duration: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  price: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  payment_id: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  status: number;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  description: string;
}
