import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllBannerAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: null })
  @_IsString()
  @IsOptional()
  position: string;
}
