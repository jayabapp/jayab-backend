import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsBoolean, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllContentQuestionAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: '' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  content_id: number;

  @ApiProperty({ required: false, default: 1 })
  @Transform(({ value }) => {
    if (value == '1') return true;
    else if (value == '0') return false;
    else return null;
  })
  @_IsBoolean()
  @IsOptional()
  not_answered: boolean;

  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  question: string;
}
