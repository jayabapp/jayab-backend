import { ApiProperty } from '@nestjs/swagger';
import { _IsInt, _IsNotEmpty } from '../pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class PaginationCursorDto {
  @ApiProperty({ required: true, example: 0 })
  @_IsInt()
  @Type(() => Number)
  @Transform(({ value }) => value || 0)
  @_IsNotEmpty()
  cursor: number;

  @ApiProperty({ title: 'تعداد در  صفحه', example: 10 })
  @_IsInt()
  @Type(() => Number)
  @Transform(({ value }) => value || 10)
  @Type(() => Number)
  @IsOptional()
  per_page: number;
}
