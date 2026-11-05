import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { IntersectionType } from '@nestjs/swagger';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { LocaleDto } from 'src/common/dto/locale.dto';
import { Type } from 'class-transformer';

export class FindAllAdvisorUserDto extends IntersectionType(PaginationCursorDto, LocaleDto) {
  @ApiProperty({ required: false, example: 'مقاله' })
  @_IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ required: false, example: '1,2,3,4,5' })
  @_IsString()
  @IsOptional()
  cities: string;

  @ApiProperty({ required: false, example: 2 })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  province_id: number;
}
