import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyReportAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @_IsEnum([1, 2])
  @Type(() => Number)
  @IsOptional()
  seen_by_admin: number;

  @ApiProperty({ required: false, example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_id: number;

  @ApiProperty({ required: false })
  @_IsString()
  @IsOptional()
  property_code: string;

  @ApiProperty({ required: false })
  @_IsString()
  @IsOptional()
  property_title: string;

  @ApiProperty({ required: false })
  @_IsString()
  @IsOptional()
  user_mobile: string;
}
