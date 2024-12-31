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

export class CreateSubscriptionPlanUserDto {
  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  group: string
        

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  title: string
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  duration: number
        

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  price: number
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  price_with_discount: number
        

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean
        

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  sort: number
        

  @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_promote: boolean
}