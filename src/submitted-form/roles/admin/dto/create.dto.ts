import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _IsNumber,
  _IsBoolean,
  _MaxLength,
  _MinLength,
} from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';
import { TextInputValidator, TextInputValidatorType } from 'src/common/validators/text-input.validator';

export class CreateSubmittedFormAdminDto {
  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  content_id: number;

  @ApiProperty({ required: false, example: '09120000000' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_MaxLength(64)
  @_MinLength(1)
  @IsOptional()
  full_name: string;

  @ApiProperty({ required: false, example: 'لورم ایپسوم متن ساختگی' })
  @_IsString()
  @IsOptional()
  ip: string;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  status: number;
}
