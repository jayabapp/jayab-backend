import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import {
  _IsBoolean,
  _IsEnum,
  _IsInt,
  _IsNotEmpty,
  _IsNumber,
  _IsString,
  _Length,
  _Max,
  _Min,
} from 'src/common/pipes/validator-translate.pipe';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';

class CommonDto {
  @ApiProperty({ required: true, example: 'عنوان' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, example: 'عنوان' })
  @_IsString()
  @IsOptional()
  ribbon_title: string = null;

  @ApiProperty({ required: true, example: 'عنوان' })
  @_IsString()
  @IsOptional()
  ribbon_title_color: string = null;

  @ApiProperty({ required: true, example: 'عنوان' })
  @_IsString()
  @IsOptional()
  ribbon_bg_color: string = null;

  @ApiProperty({ required: true, example: 20000 })
  @_Max(100_000_000)
  @_Min(0)
  @_IsInt()
  @_IsNotEmpty()
  price: number;

  @ApiProperty({ required: true, example: 0 })
  @Transform(({ value }) => value || null)
  @_Max(10000000)
  @_Min(0)
  @_IsNumber()
  @IsOptional()
  price_with_discount: number = null;

  @ApiProperty({ required: true, example: true })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @IsOptional()
  sort: number;

  @ApiProperty({ required: true, example: 'توضیحات' })
  @_IsString()
  @IsOptional()
  description: string;
}
export class CreateSubscriptionPlanAdminDto extends CommonDto {
  @ApiProperty({ required: true, example: 'گروه' })
  @_IsEnum(SubscriptionPlanGroup)
  @_IsNotEmpty()
  group: SubscriptionPlanGroup;

  @ApiProperty({ required: true, example: 30, description: 'تعداد روز پکیج' })
  @_Max(365)
  @_Min(1)
  @_IsNumber()
  @_IsNotEmpty()
  duration: number;
}

export class UpdateSubscriptionPlanAdminDto extends CommonDto {
  @ApiProperty({ required: true, example: 30, description: 'تعداد روز پکیج' })
  @_Max(365)
  @_Min(1)
  @_IsNumber()
  @_IsNotEmpty()
  duration: number;
}
