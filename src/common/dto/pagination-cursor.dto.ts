import { ApiProperty } from '@nestjs/swagger';
import { _IsInt, _IsNotEmpty } from '../pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';

export class PaginationCursorDto {
  @ApiProperty({ required: true, default: 0 })
  @_IsInt()
  @Type(() => Number)
  @Transform(({ value }) => value || 0)
  @_IsNotEmpty()
  cursor: number;
}
