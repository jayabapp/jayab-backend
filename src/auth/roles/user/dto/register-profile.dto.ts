import { ApiProperty } from '@nestjs/swagger';
import { _IsNotEmpty, _IsString, _MaxLength, _MinLength } from 'src/common/pipes/validator-translate.pipe';

export class RegisterProfileDto {
  @ApiProperty({ required: true, default: 'کاربر تست' })
  @_MaxLength(64)
  @_MinLength(1)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;
}
