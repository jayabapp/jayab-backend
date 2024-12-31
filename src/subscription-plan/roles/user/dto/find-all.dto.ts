import { ApiProperty } from '@nestjs/swagger';
import { _IsEnum, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { SubscriptionPlanGroup } from 'src/subscription-plan/common/subscription-plan-group.type';

export class FindAllSubscriptionPlanUserDto {
  @ApiProperty({ required: true, enum: SubscriptionPlanGroup, default: SubscriptionPlanGroup.PROPERTY })
  @_IsEnum(SubscriptionPlanGroup)
  @_IsNotEmpty()
  type: SubscriptionPlanGroup;
}
