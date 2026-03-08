import { ApiProperty } from '@nestjs/swagger';
import {
  _ArrayNotEmpty,
  _IsArray,
  _IsEnum,
  _IsInt,
  _IsNotEmpty,
  _IsString,
  _Min,
} from 'src/common/pipes/validator-translate.pipe';

export class CallbackMianDto {
  @ApiProperty({ required: true, example: 535 })
  @_Min(0)
  @_IsInt()
  @_IsNotEmpty()
  property_id: number;

  @ApiProperty({ required: true, example: ['2026-02-23'] })
  @_IsArray()
  @_ArrayNotEmpty()
  dates: string[];

  @ApiProperty({ required: true, example: 'block' })
  @_IsEnum(['unblock', 'block'])
  @_IsString()
  @_IsNotEmpty()
  action: 'unblock' | 'block';
}
