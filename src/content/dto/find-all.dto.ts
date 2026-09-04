import { _IsBoolean, _IsEnum, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export enum ContentSort {
  DEFAULT = 'default',
  MOST_VISITED = 'mostVisited',
  NEWEST = 'newest',
}
export class FindAllContentSharedDto extends PaginationDto {
  @ApiProperty({ required: true, example: 'blog' })
  @_IsString()
  @_IsNotEmpty()
  key: string;

  @ApiProperty({ required: false, example: 'مقاله' })
  @_IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ enum: ContentSort, required: false, example: ContentSort.DEFAULT })
  @_IsEnum(ContentSort)
  @IsOptional()
  sort: ContentSort;

  @ApiProperty({ required: false, example: true })
  @Transform(({ value }) => value === true || value === 'true' || value === '1')
  @_IsBoolean()
  @IsOptional()
  summary: boolean = false;
}
