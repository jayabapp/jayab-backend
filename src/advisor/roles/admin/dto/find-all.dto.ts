import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import {
  _IsBoolean,
  _IsEnum,
  _IsInt,
  _IsNumberString,
  _IsString,
} from 'src/common/pipes/validator-translate.pipe';

export class FindAllAdvisorAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '123456' })
  @_IsString()
  @IsOptional()
  referral_code: string;

  @ApiProperty({ required: false, example: 'موبایل' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, example: 'رضا' })
  @_IsString()
  @IsOptional()
  full_name: string;

  @ApiProperty({ required: false, example: AdvisorStatus.APPROVED })
  @_IsEnum(AdvisorStatus)
  @Type(() => Number)
  @IsOptional()
  status: AdvisorStatus;

  @ApiProperty({ required: false, example: 'مشاور ویژه' })
  @_IsBoolean()
  @Transform(({ value }) => (value && value == 'true' ? true : false))
  @IsOptional()
  is_special: boolean;

  @ApiProperty({ required: false })
  @_IsBoolean()
  @Transform(({ value }) => (value && value == 'true' ? true : false))
  @IsOptional()
  no_sub: boolean;

  @ApiProperty({ required: false })
  @_IsString()
  @IsOptional()
  national_code: string;
}
