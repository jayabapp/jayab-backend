import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';
import {
  _Length,
  _IsNumberString,
  _IsInt,
  _IsNotEmpty,
  _Min,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';

export class UpdateUserAdminDto {
  @ApiProperty({ required: true, example: 'کاربر تست' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_banned: boolean;

  @ApiProperty({ required: true, example: '' })
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;
}
