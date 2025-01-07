import { ApiProperty } from '@nestjs/swagger';
import { _IsInt, _Max, _Min, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class UpdatePropertyAdvisorCommissionOwnerDto {
  //also is in update property steps
  @ApiProperty({ required: true, title: 'کمیسیون مشاور', default: 5 })
  @_IsInt()
  @_Max(50)
  @_Min(0)
  @_IsNotEmpty()
  advisor_commission: number;
}
