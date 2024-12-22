import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, Validate } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsIn, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { IsJalaaliDate, DateType } from 'src/common/validators/is-date.validator';

export class AdminReportDto {
  @ApiProperty({ required: false, default: '' })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  category_id: number;

  @ApiProperty({ required: false, default: '' })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  product_id: number;

  @ApiProperty({ required: false, default: '' })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  attribute_id: number;

  @ApiProperty({ required: false, default: { year: 1402, month: 10, day: 10 } })
  @Validate(IsJalaaliDate)
  @IsOptional()
  from_date: DateType;

  @ApiProperty({ required: false, default: { year: 1402, month: 12, day: 10 } })
  @Validate(IsJalaaliDate)
  @IsOptional()
  to_date: DateType;

  @ApiProperty({ required: false, default: null })
  @_IsInt()
  @IsOptional()
  business_id: number;
}
