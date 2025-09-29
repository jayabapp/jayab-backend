import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import { _IsNotEmpty, _IsString, _MaxLength, _MinLength } from 'src/common/pipes/validator-translate.pipe';
import { TextInputValidator, TextInputValidatorType } from 'src/common/validators/text-input.validator';

export class RegisterProfileDto {
  @ApiProperty({ required: true, example: 'کاربر تست' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_MaxLength(64)
  @_MinLength(1)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;
}
