import { ApiProperty } from '@nestjs/swagger';
import { IsAlphanumeric } from 'class-validator';
import { _IsAlphanumeric, _IsArray, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { PaymentGatewayParams } from 'src/payment-gateway/common/payment-gateway.enum';

export class UpdatePaymentGatewayAdminDto {
  @ApiProperty({ required: true, example: '' })
  @_IsArray()
  @_IsNotEmpty()
  params: PaymentGatewayParams[];
}
