import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsNotEmpty, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyAuthorizeAdminDto extends PaginationDto {
  @ApiProperty({ required: true, example: 20 })
  @Type(() => Number)
  @_IsInt()
  @_IsNotEmpty()
  status: number;

  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  property_code: string;

  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  property_title: string;
}
