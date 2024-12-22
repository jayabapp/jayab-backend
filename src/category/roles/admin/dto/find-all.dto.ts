import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllCategoryAdminDto extends PaginationDto {
  @ApiProperty({ required: false, default: {} })
  @_IsString()
  @IsOptional()
  title: any;
}
