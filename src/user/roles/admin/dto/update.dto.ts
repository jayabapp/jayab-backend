import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import {
  _Length,
  _IsNumberString,
  _IsInt,
  _IsNotEmpty,
  _Min,
  _IsBoolean,
  _IsString,
  _MaxLength,
  _MinLength,
} from 'src/common/pipes/validator-translate.pipe';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';
import { TextInputValidator, TextInputValidatorType } from 'src/common/validators/text-input.validator';

export class UpdateUserAdminDto {
  @ApiProperty({ required: true, example: false })
  @_IsBoolean()
  @_IsNotEmpty()
  is_banned: boolean;

  @ApiProperty({ required: true, example: false })
  @_IsBoolean()
  @_IsNotEmpty()
  block_click_limit: boolean;

  @ApiProperty({ required: true, example: '' })
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;

  @ApiProperty({ required: false, example: '' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_MaxLength(64)
  @_MinLength(1)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;
}
