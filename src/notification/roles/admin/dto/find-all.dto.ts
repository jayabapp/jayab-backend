import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsString } from 'src/common/pipes/validator-translate.pipe';

export class FindAllNotificationAdminDto {}

export class FindAllSentNotificationAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: '09121234567' })
  @_IsString()
  @IsOptional()
  mobile_number: string;
}
