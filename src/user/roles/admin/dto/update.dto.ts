import { ApiProperty } from '@nestjs/swagger';
import {
  _Length,
  _IsNumberString,
  _IsInt,
  _IsNotEmpty,
  _Min,
  _IsBoolean,
} from 'src/common/pipes/validator-translate.pipe';

export class UpdateUserAdminDto {
  @ApiProperty({ required: true, default: 'کاربر تست' })
  @_IsBoolean()
  @_IsNotEmpty()
  is_banned: boolean;
}
