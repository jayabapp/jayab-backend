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

export class CreateSubscriptionAdminDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  subscription_plan_id: number;

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

  // @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  // @_IsBoolean()
  // @IsOptional()
  // is_promote: boolean;
}
