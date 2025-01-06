import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';

export class FindAllPropertyAuthorizeOwnerDto extends PaginationCursorDto {}
