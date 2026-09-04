import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { _IsInt } from 'src/common/pipes/validator-translate.pipe';
import { Type } from 'class-transformer';

export class ResolveLandingLocationDto {
  @ApiPropertyOptional({ example: 12 })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  city_id?: number;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  province_id?: number;
}
