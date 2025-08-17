import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { _IsEnum, _IsInt, _IsNotEmpty, _IsString, _Min } from 'src/common/pipes/validator-translate.pipe';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';

export class PaySubscriptionPropertyOwnerDto {
  @ApiProperty({ required: true, example: 1 })
  @_Min(1)
  @_IsInt()
  @IsOptional()
  subscription_id: number;

  @ApiProperty({ required: true, example: 1 })
  @_Min(1)
  @_IsInt()
  @IsOptional()
  promote_id: number;

  @ApiProperty({ required: true, example: 'test.com' })
  @_IsString()
  @_IsNotEmpty()
  redirect_url: string;

  @ApiProperty({ enum: PaymentGatewayEnum, required: false, example: PaymentGatewayEnum.SANDBOX })
  @Transform(({ value }) => value && value.toUpperCase())
  @_IsEnum(PaymentGatewayEnum)
  @IsOptional()
  gateway: PaymentGatewayEnum;
}
