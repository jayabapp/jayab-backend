import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllAdvisorAdminDto extends PaginationDto {
  @ApiProperty({ required: false, description: '123456' })
  @_IsString()
  @IsOptional()
  referral_code: string;

  @ApiProperty({ required: false, description: 'مشاور ویژه' })
  @_IsBoolean()
  @IsOptional()
  is_special: boolean;

  @ApiProperty({ required: false, description: 'موبایل' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, description: 'رضا' })
  @_IsString()
  @IsOptional()
  full_name: string;
}
