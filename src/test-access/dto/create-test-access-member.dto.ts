import { _IsNotEmpty, _IsNumberString } from 'src/common/pipes/validator-translate.pipe';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';
import { ApiProperty } from '@nestjs/swagger';
import { Validate } from 'class-validator';

export class CreateTestAccessMemberDto {
  @ApiProperty({ example: '09120000000' })
  @_IsNumberString()
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;
}
