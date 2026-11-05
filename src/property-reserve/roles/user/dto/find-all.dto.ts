import { ApiProperty } from '@nestjs/swagger';
import { LocaleDto } from 'src/common/dto/locale.dto';
import { IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { _IsBoolean, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';

export class FindAllPropertyReserveUserDto extends LocaleDto {
  @ApiProperty({ required: true, example: 'active' })
  @_IsNotEmpty()
  type: 'active' | 'history';
}
