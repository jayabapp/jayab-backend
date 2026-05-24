import { ApiProperty } from '@nestjs/swagger';
import { _IsNotEmpty, _IsNumberString, _Length } from 'src/common/pipes/validator-translate.pipe';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';
import { IsOptional, Validate } from 'class-validator';

export class CreateOTPDto {
  @ApiProperty({ required: true, example: '09120000000' })
  @_IsNumberString()
  @Validate(IsMobileNumber)
  @_IsNotEmpty()
  mobile_number: string;
}

export class VerifyOTPDto extends CreateOTPDto {
  @ApiProperty({ example: '12345', required: true })
  @_Length(4, 4)
  @_IsNumberString()
  @_IsNotEmpty()
  code: string;

  @ApiProperty({
    required: false,
    example: {
      utm_source: '',
      utm_medium: '',
      utm_campaign: '',
      utm_term: '',
      utm_content: '',
      redirect_url: '',
    },
  })
  @IsOptional()
  query_params: object;
}
