import { _IsIn, _IsInt, _IsString, _Length, _Max } from 'src/common/pipes/validator-translate.pipe';
import { normalizePersianSearchText } from 'src/property/common/helpers/search-text.helper';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class FindAllCityUserDto {
  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  cities: string;

  @ApiProperty({ required: false, example: '' })
  @Transform(({ value }) => normalizePersianSearchText(value))
  @_IsString()
  @_Length(2, 80)
  @IsOptional()
  q: string;

  @ApiProperty({ required: false, example: {} })
  @Type(() => Number)
  @_IsIn([0, 1])
  @IsOptional()
  is_parent: number;

  @ApiProperty({ required: false, example: 3 })
  @_Max(5)
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  depth: number;
}
