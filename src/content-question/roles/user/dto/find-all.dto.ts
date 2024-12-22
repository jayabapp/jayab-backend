import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class FindAllContentQuestionUserDto extends PaginationDto {
  @ApiProperty({ required: true, default: 1 })
  @Type(() => Number)
  @_IsInt()
  @_IsNotEmpty()
  content_id: number;
}
