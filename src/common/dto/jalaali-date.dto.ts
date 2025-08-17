import { ApiProperty } from '@nestjs/swagger';
import { _IsInt, _Min, _Max, _IsNotEmpty } from '../pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class JalaaliDateDto {
  @ApiProperty({ required: true, example: 1 })
  @Type(() => Number)
  @_IsInt()
  @_Min(1)
  @_Max(31)
  @_IsNotEmpty()
  day: number;

  @ApiProperty({ required: true, example: 12 })
  @Type(() => Number)
  @_IsInt()
  @_Min(1)
  @_Max(12)
  @_IsNotEmpty()
  month: number;

  @ApiProperty({ required: true, example: 1402 })
  @Type(() => Number)
  @_IsInt()
  @_Min(1300)
  @_Max(1420)
  @_IsNotEmpty()
  year: number;
}
