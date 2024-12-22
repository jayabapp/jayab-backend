import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsInt, _IsNotEmpty } from '../pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class PaginationDto {
  @ApiProperty({ title: 'صفحه', default: 1 })
  @_IsInt()
  @Type(() => Number)
  @_IsNotEmpty()
  page: number;

  @ApiPropertyOptional({ title: 'تعداد در  صفحه', default: 10 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  per_page: number;
}
