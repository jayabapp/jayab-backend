import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { IsJalaaliDate, DateType } from 'src/common/validators/is-date.validator';

export class FindAllSubscriptionAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false })
  @_IsString()
  @IsOptional()
  type: 'property' | 'advisor';

  @ApiProperty({ required: false })
  @_IsString()
  @IsOptional()
  extra_type: 'is_renew' | 'is_promote' | 'is_special_advisor' | 'is_normal_advisor';

  @ApiProperty({ required: false, example: { year: 1404, month: 2, day: 10 } })
  @Validate(IsJalaaliDate)
  @IsOptional()
  from_date: DateType;

  @ApiProperty({ required: false, example: { year: 1404, month: 2, day: 10 } })
  @Validate(IsJalaaliDate)
  @IsOptional()
  to_date: DateType;

  @ApiProperty({ required: false, example: 1 })
  @_IsString()
  @IsOptional()
  property_id: string;

  @ApiProperty({ required: false, example: 1 })
  @_IsString()
  @IsOptional()
  advisor_id: string;
}
