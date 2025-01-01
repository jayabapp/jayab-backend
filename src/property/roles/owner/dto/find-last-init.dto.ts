import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { _IsString, _Length, _IsNotEmpty, _IsInt } from 'src/common/pipes/validator-translate.pipe';

export class FindLastInitPropertyOwnerDto {
  @ApiProperty({ required: false, title: 'اسم ملک' })
  @_IsInt()
  @Type(() => Number)
  @IsOptional()
  property_id: number;
}
