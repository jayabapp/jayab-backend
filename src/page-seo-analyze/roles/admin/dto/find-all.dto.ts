import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPageSeoAnalyzeAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  url: string;

  @ApiProperty({ required: false, example: '' })
  @Transform(({ value }) => {
    if (value === 'true') return true
    else false
  })
  @_IsBoolean()
  @IsOptional()
  title_issue: boolean;

  @ApiProperty({ required: false, example: '' })
  @Transform(({ value }) => {
    if (value === 'true') return true
    else false
  })
  @_IsBoolean()
  @IsOptional()
  description_issue: boolean;

  @ApiProperty({ required: false, example: '' })
  @Transform(({ value }) => {
    if (value === 'true') return true
    else false
  })
  @_IsBoolean()
  @IsOptional()
  without_h1: boolean;

  @ApiProperty({ required: false, example: '' })
  @Transform(({ value }) => {
    if (value === 'true') return true
    else false
  })
  @_IsBoolean()
  @IsOptional()
  h1_issue: boolean;

  @ApiProperty({ required: false, example: '' })
  @Transform(({ value }) => {
    if (value === 'true') return true
    else false
  })
  @_IsBoolean()
  @IsOptional()
  alt_image_issue: boolean;
}
