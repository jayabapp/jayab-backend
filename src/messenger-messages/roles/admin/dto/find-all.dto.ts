import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { PaginationDto } from 'src/common/dto/pagination-page.dto';
import { _IsInt } from 'src/common/pipes/validator-translate.pipe';

export class FindAllMessengerMessagesAdminDto extends PaginationDto {
  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  user_id: number;

  @ApiProperty({ required: false, example: 1 })
  @Type(() => Number)
  @_IsInt()
  @IsOptional()
  chatroom_id: number;

  // @ApiProperty({ required: false, example: '' })
  // @_IsString()
  // @IsOptional()
  // mobile_number: string;
}
