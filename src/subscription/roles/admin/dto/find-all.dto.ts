import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsDate, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';
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

  @ApiProperty({ required: false })
  @IsOptional()
  from_date: Date;

  @ApiProperty({ required: false })
  @IsOptional()
  to_date: Date;

  @ApiProperty({ required: false, example: 1 })
  @_IsString()
  @IsOptional()
  property_id: string;

  @ApiProperty({ required: false, example: 1 })
  @_IsString()
  @IsOptional()
  advisor_id: string;
}
