import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _IsEnum,
  _Max,
  _Min,
  _Length,
} from 'src/common/pipes/validator-translate.pipe';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';

class CommonDto {
  @ApiProperty({ required: true, default: 'عنوان' })
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  title: string;

  @ApiProperty({ required: true, default: 20000 })
  @_Max(100_000_000)
  @_Min(0)
  @_IsInt()
  @_IsNotEmpty()
  price: number;

  @ApiProperty({ required: true, default: 0 })
  @_Max(10000000)
  @_Min(0)
  @_IsNumber()
  @_IsNotEmpty()
  price_with_discount: number;

  @ApiProperty({ required: true, default: true })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean;

  @ApiProperty({ required: true, default: 1 })
  @_IsInt()
  @_IsNotEmpty()
  sort: number;

  @ApiProperty({ required: true, default: 'توضیحات' })
  @_IsString()
  @IsOptional()
  description: string;
}
export class CreateSubscriptionPlanAdminDto extends CommonDto {
  @ApiProperty({ required: true, default: 'گروه' })
  @_IsEnum(SubscriptionPlanGroup)
  @_IsNotEmpty()
  group: SubscriptionPlanGroup;

  @ApiProperty({ required: true, default: 30, description: 'تعداد روز پکیج' })
  @_Max(365)
  @_Min(1)
  @_IsNumber()
  @_IsNotEmpty()
  duration: number;
}

export class UpdateSubscriptionPlanAdminDto extends CommonDto {
  @ApiProperty({ required: true, default: 30, description: 'تعداد روز پکیج' })
  @_Max(365)
  @_Min(1)
  @_IsNumber()
  @_IsNotEmpty()
  duration: number;
}
