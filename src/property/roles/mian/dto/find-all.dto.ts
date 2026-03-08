import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import { _IsString } from 'src/common/pipes/validator-translate.pipe';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';

export class FindAllPropertyMianDto {
  @ApiProperty({ required: false })
  @Validate(IsMobileNumber)
  @_IsString()
  @IsOptional()
  phone_number: string;
}
