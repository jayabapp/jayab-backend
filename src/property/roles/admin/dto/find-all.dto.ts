import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { AdvisorStatus } from 'src/advisor/common/advisor-status.type';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  // @_IsEnum(AdvisorStatus)
  @Transform(({ value }) => +value)
  @IsOptional()
  status: number;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) => +value)
  @IsOptional()
  owner_id: number;

  @ApiProperty({ required: false, example: '0912' })
  @_IsString()
  @IsOptional()
  owner_mobile_number: string;

  @ApiProperty({ required: false, example: 1 })
  @IsOptional()
  code: string;

  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ required: false, example: true })
  @_IsBoolean()
  @Transform(({ value }) => (value && value == 'true' ? true : false))
  @IsOptional()
  authorized: boolean;

  @ApiProperty({ required: false, example: true })
  @_IsBoolean()
  @Transform(({ value }) => (value && value == 'true' ? true : false))
  @IsOptional()
  expired: boolean;

  @ApiProperty({ required: false, example: true })
  @_IsBoolean()
  @Transform(({ value }) => (value && value == 'true' ? true : false))
  @IsOptional()
  is_promoted: boolean;
}
