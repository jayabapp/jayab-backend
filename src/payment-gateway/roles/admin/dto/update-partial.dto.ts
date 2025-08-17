import { PickType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { _IsBoolean, _IsIn, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class UpdatePartialPaymentGatewayAdminDto {
  @ApiProperty({ required: true, example: '' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_active: boolean;
}
