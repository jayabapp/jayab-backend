import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllContentQuestionAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  content_id: number;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) => {
    if (value == 'true') return true;
    else return null;
  })
  @_IsBoolean()
  @IsOptional()
  not_answered: boolean;

  @ApiProperty({ required: false, example: 1 })
  @Transform(({ value }) => {
    if (value == 'true') return true;
    else return null;
  })
  @_IsBoolean()
  @IsOptional()
  is_not_published: boolean;

  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  question: string;
}
