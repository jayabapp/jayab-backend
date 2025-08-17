import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsInt, _IsNotEmpty, _IsString, _IsNumber } from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class CreatePaymentUserDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  user_id: number;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  amount: number;

  @ApiProperty({ required: true, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @_IsNotEmpty()
  authority: string;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  ref_id: string;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  status: number;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  description: string;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  order_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  reserve_id: number;
}
