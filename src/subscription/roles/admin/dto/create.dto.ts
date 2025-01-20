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
  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  subscription_plan_id: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_id: number;

  @ApiProperty({ required: false, default: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  advisor_id: number;

  // @ApiProperty({ required: true, default: 'لورم ایپسوم متن ساختگی' })
  // @_IsBoolean()
  // @IsOptional()
  // is_promote: boolean;
}
