import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Validate, ValidateIf } from 'class-validator';
import {
  _ArrayMinSize,
  _IsArray,
  _IsBoolean,
  _IsEnum,
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _Min,
} from 'src/common/pipes/validator-translate.pipe';
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

  @ApiProperty({ required: false, example: true })
  @_IsBoolean()
  @IsOptional()
  photo_upgrade_enabled?: boolean;

  @ApiProperty({ required: false, type: [Number], example: [1, 2, 3] })
  @_IsArray()
  @_ArrayMinSize(1)
  @IsInt({ each: true })
  @IsOptional()
  photo_upgrade_image_ids?: number[];
}

export class PhotoUpgradeQuotePropertyOwnerDto {
  @ApiProperty({ required: false, type: [Number], example: [1, 2, 3] })
  @_IsArray()
  @_ArrayMinSize(1)
  @IsInt({ each: true })
  @IsOptional()
  image_ids?: number[];
}
