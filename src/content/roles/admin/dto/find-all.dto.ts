import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsIn, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllContentAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  title: string;

  @ApiProperty({ required: false, default: 'aboutUs' })
  @_IsString()
  @IsOptional()
  key: string;

  @ApiProperty({ required: false, default: '' })
  @_IsString()
  @IsOptional()
  small_text: string;

  @ApiProperty({ required: false, default: '' })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  category_id: string;
}
