import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt, _IsNumberString, _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyReserveAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '' })
  @_IsString()
  @IsOptional()
  property_code: string;

  @ApiProperty({ required: false, example: '' })
  @_IsNumberString()
  @IsOptional()
  user_mobile_number: string;

  @ApiProperty({ required: false, example: '' })
  @IsOptional()
  check_in: Date;
}
