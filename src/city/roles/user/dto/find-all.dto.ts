import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsIn, _IsInt, _IsString, _Max } from 'src/common/pipes/validator-translate.pipe';

export class FindAllCityUserDto extends PaginationDto {
  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  cities: string;

  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ required: false, default: {} })
  @Type(() => Number)
  @_IsIn([0, 1])
  @IsOptional()
  is_parent: number;

  @ApiProperty({ required: false, default: 3 })
  @_Max(5)
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  depth: number;
}
