import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { PaginationCursorDto } from 'src/common/dto/pagination-cursor.dto';
import {
  _IsBoolean,
  _IsEnum,
  _IsIn,
  _IsNotEmpty,
  _IsString,
} from 'src/common/pipes/validator-translate.pipe';

export const LANDING_PAGE_PLACEMENT = ['home', 'footer'] as const;
export type LANDING_PAGE_PLACEMENT = (typeof LANDING_PAGE_PLACEMENT)[number];

export class FindAllLandingPageUserDto {
  @ApiProperty({
    required: true,
    enum: LANDING_PAGE_PLACEMENT,
    example: LANDING_PAGE_PLACEMENT[0],
    description: `'home' | 'footer'`,
  })
  @_IsEnum(LANDING_PAGE_PLACEMENT)
  @_IsNotEmpty()
  placement: LANDING_PAGE_PLACEMENT;
}
