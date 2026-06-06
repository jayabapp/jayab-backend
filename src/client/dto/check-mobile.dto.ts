import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import normalizeMobileNumber from 'src/common/helpers/normalize-mobile.helper';
import { _IsIn, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { IsMobileNumber } from 'src/common/validators/is-mobile-number.validator';

export class CheckMobileIsExistClientDto {
  @ApiProperty({ required: true })
  @Transform(({ value }) => normalizeMobileNumber(value))
  @Validate(IsMobileNumber)
  @_IsString()
  @_IsNotEmpty()
  mobile_number: string;
}
