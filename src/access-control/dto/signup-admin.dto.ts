import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { AdminUserPassDto } from 'src/auth/roles/admin/dto/auth-admin.dto';
import {
  _IsString,
  _IsNotEmpty,
  _IsInt,
  _MaxLength,
  _MinLength,
} from 'src/common/pipes/validator-translate.pipe';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';
import { TextInputValidator, TextInputValidatorType } from 'src/common/validators/text-input.validator';

export class SignUpAdminDto extends AdminUserPassDto {
  @ApiProperty({ required: true, example: '09126048740' })
  @_IsString()
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;

  @ApiProperty({ required: true, example: 'سوپر ادمین' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_MaxLength(64)
  @_MinLength(1)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @_IsNotEmpty()
  role_id: number;
}

export class EditAdminDto extends PartialType(AdminUserPassDto) {
  @ApiProperty({ required: true, example: '09126048740' })
  @_IsString()
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;

  @ApiProperty({ required: true, example: 'سوپر ادمین' })
  @Validate(TextInputValidator, [{ noNumbers: true, onlyFa: true } as TextInputValidatorType])
  @_MaxLength(64)
  @_MinLength(1)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;

  @ApiProperty({ required: true, example: 1 })
  @_IsInt()
  @Validate(IsExist, ['accessControlRole', 'id'])
  @_IsNotEmpty()
  role_id: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @IsOptional()
  business_id: number;
}
