import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { _IsInt, _IsNotEmpty } from '../pipes/validator-translate.pipe';

export class PaginationDto {
  @ApiProperty({ title: 'صفحه', example: 1 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  page: number = 1;

  @ApiPropertyOptional({ title: 'تعداد در  صفحه', example: 10 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  per_page: number;

  // @ApiPropertyOptional({ example: 100 })
  // @_IsInt()
  // @Type(() => Number)
  // @IsOptional()
  // take?: number = 1000;

  @ApiPropertyOptional({ example: 10 })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  skip?: number = 0;
}
