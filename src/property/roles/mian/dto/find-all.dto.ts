import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';

export class FindAllPropertyMianDto {
  @ApiProperty({ required: false, description: 'Ex: 09120000000' })
  @Validate(IsMobileNumber)
  @_IsString()
  @_IsNotEmpty()
  phone_number: string;
}
