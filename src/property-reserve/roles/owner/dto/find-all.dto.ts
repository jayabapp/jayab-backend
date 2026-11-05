import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import { IntersectionType } from '@nestjs/swagger';
import { LocaleDto } from 'src/common/dto/locale.dto';

export class FindAllPropertyReserveOwnerDto extends IntersectionType(PaginationCursorDto, LocaleDto) {}
