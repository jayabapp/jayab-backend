import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';

export enum ContentSort {
  DEFAULT = 'default',
  MOST_VISITED = 'mostVisited',
  NEWEST = 'newest',
}
export class FindAllContentSharedDto extends PaginationDto {
  @ApiProperty({ required: true, default: 'blog' })
  @_IsString()
  @_IsNotEmpty()
  key: string;

  @ApiProperty({ required: false, default: 'مقاله' })
  @_IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ enum: ContentSort, required: false, default: ContentSort.DEFAULT })
  @_IsEnum(ContentSort)
  @IsOptional()
  sort: ContentSort;
}
