import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsInt, IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { _IsArray, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllAdvisorUserDto extends PaginationCursorDto {
  @ApiProperty({ required: false, example: 'مقاله' })
  @_IsString()
  @IsOptional()
  q: string;

  @ApiProperty({ required: false, example: '1,2,3,4,5' })
  @_IsString()
  @IsOptional()
  cities: string;

  @ApiProperty({ required: false, example: 2 })
  @_IsInt()
  @IsOptional()
  province_id: number;
}
