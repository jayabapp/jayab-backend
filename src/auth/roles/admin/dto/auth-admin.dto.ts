import { PartialType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import {
  _IsInt,
  _IsNotEmpty,
  _IsNumberString,
  _IsString,
  _Length,
  _MinLength,
} from 'src/common/pipes/validator-translate.pipe';
import { IsExist } from 'src/common/validators/is-exists.validator';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';

export class AdminUserPassDto {
  @ApiProperty({ required: true, default: 'superadmin' })
  @_IsString()
  @_IsNotEmpty()
  username: string;

  @ApiProperty({ required: true, default: 'admin@@1133' })
  @_IsString()
  @_MinLength(6)
  @_IsNotEmpty()
  password: string;
}

export class SignInAdminDto extends AdminUserPassDto {}

export class VerifyAdminOTPDto {
  @ApiProperty({ default: '12345', required: true })
  @_Length(5, 5)
  @_IsNumberString()
  @_IsNotEmpty()
  code: string;
}
