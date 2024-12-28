import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllAdvisorAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: '123456' })
  @_IsString()
  @IsOptional()
  referral_code: string;

  @ApiProperty({ required: false, default: 'مشاور ویژه' })
  @_IsBoolean()
  @IsOptional()
  is_special: boolean;

  @ApiProperty({ required: false, default: 'موبایل' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, default: 'رضا' })
  @_IsString()
  @IsOptional()
  full_name: string;

  @ApiProperty({ required: false, default: AdvisorStatus.APPROVED })
  @_IsEnum(AdvisorStatus)
  @Type(() => Number)
  @IsOptional()
  status: AdvisorStatus;
}
