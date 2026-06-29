import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllContentQuestionUserDto extends PaginationDto {
  @ApiProperty({ required: false })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  content_id: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  product_id: number;

  @ApiProperty({ required: false })
  @_IsString()
  @IsOptional()
  content_key: string;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  content_category_id: number;

  @ApiProperty({ required: false })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  content_parent_category_id: number;
}
