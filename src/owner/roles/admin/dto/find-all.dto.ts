import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsEnum, _IsInt, _IsString } from 'src/common/pipes/validator-translate.pipe';
import { OwnerStatus } from 'src/owner/common/owner-status.type';

export class FindAllOwnerAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 'موبایل' })
  @_IsString()
  @IsOptional()
  mobile_number: string;

  @ApiProperty({ required: false, example: 'رضا' })
  @_IsString()
  @IsOptional()
  full_name: string;

  @ApiProperty({ required: false, example: OwnerStatus.APPROVED })
  @_IsEnum(OwnerStatus)
  @Type(() => Number)
  @IsOptional()
  status: OwnerStatus;
}
