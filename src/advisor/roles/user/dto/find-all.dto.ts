import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { _IsArray, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllAdvisorUserDto extends PaginationCursorDto {
  @ApiProperty({ required: false, default: 'مقاله' })
  @_IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ required: false, default: '1,2,3,4,5' })
  @_IsString()
  @IsOptional()
  cities: string;
}
