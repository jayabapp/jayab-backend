import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: 1 })
  // @_IsEnum(AdvisorStatus)
  @Transform(({ value }) => +value)
  @IsOptional()
  status: number;

  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  title: string;

  // @ApiProperty({ required: false, default: '' })
  // @_IsString()
  // @IsOptional()
  // mobile_number: string;
}
