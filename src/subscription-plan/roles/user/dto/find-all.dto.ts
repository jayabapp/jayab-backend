import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { _IsEnum, _IsInt, _IsNotEmpty, _Min } from 'src/common/pipes/validator-translate.pipe';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';

export class FindAllSubscriptionPlanUserDto {
  @ApiProperty({ required: true, enum: SubscriptionPlanGroup, example: SubscriptionPlanGroup.PROPERTY })
  @_IsEnum(SubscriptionPlanGroup)
  @_IsNotEmpty()
  type: SubscriptionPlanGroup;

  @ApiProperty({ required: false, example: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_id: number;
}
