import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { _IsBoolean, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyReserveUserDto {
  @ApiProperty({ required: true, example: 'active' })
  @_IsNotEmpty()
  type: 'active' | 'history';
}
