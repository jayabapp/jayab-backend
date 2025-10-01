import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, Validate, ValidateIf } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _Min,
  _Length,
  _IsNumberString,
  _MaxLength,
  _IsArray,
  _IsEnum,
} from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsNationalId } from 'src/common/validators/national-code.validator';
import { PaymentGatewayEnum } from 'src/payment-gateway/common/payment-gateway.enum';
import { TextInputValidator, TextInputValidatorType } from 'src/common/validators/text-input.validator';

export class RegisterOwnerUserDto {
  @ApiProperty({ required: true, example: 'کاربر تست' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;

  @ApiProperty({ required: true, example: '0603400000' })
  @Validate(IsNationalId)
  national_code: string;

  @ApiProperty({ required: true, example: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  selfie_image_id: number;
}

export class RegisterAdvisorUserDto {
  @ApiProperty({ required: true, example: 'کاربر تست' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_Length(1, 128)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;

  @ApiProperty({ required: false, example: 'آدرس تست' })
  @_Length(0, 512)
  @_IsString()
  @IsOptional()
  address: string;

  @ApiProperty({ example: '0603400000', required: false })
  @Validate(IsNationalId)
  @IsOptional()
  national_code: string;

  @ApiProperty({ required: false, description: 'tel number without zero', example: '12345678' })
  @_MaxLength(11)
  // @_MaxLength(8)
  @_IsNumberString()
  @IsOptional()
  tel: string;

  // @ApiProperty({ required: false, example: '021' })
  // @_IsNumberString()
  // @_MaxLength(3)
  // @IsOptional()
  // area_code: string;

  @ApiProperty({ required: false, example: [1] })
  @_IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  cityIds: number[];

  @ApiProperty({ required: true, example: false })
  @_IsBoolean()
  @_IsNotEmpty()
  is_special: boolean;

  /* -------------------------------------------------------------------------- */
  // images
  @ApiProperty({ required: true, example: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  profile_image_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  national_card_image_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_Min(1)
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  document_image_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsString()
  @IsOptional()
  referrer_code: string;
}

export class BuySubscriptionAdvisorDto {
  @ApiProperty({ required: false, example: false })
  @_Min(1)
  @_IsInt()
  @IsOptional()
  plan_id: number;

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
