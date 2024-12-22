import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Validate } from 'class-validator';
import moment from 'moment-jalaali';
import { _IsNotEmpty, _IsString, _MaxLength, _MinLength } from 'src/common/pipes/validator-translate.pipe';
import { DateType, IsJalaaliDate } from 'src/common/validators/is-date.validator';

export class RegisterProfileDto {
  @ApiProperty({ required: true, default: 'کاربر تست' })
  @_MaxLength(50)
  @_MinLength(3)
  @_IsString()
  @_IsNotEmpty()
  full_name: string;

  @ApiProperty({ required: false, default: { year: 1366, month: 11, day: 29 } })
  @Validate(IsJalaaliDate, ['تاریخ تولد', moment().jYear()])
  @IsOptional()
  birthday: DateType;
}
