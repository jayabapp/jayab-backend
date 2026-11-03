import { _IsEnum, _IsNotEmpty } from 'src/common/pipes/validator-translate.pipe';
import { ApiProperty } from '@nestjs/swagger';
import { LocaleDto } from 'src/common/dto/locale.dto';

export const LANDING_PAGE_PLACEMENT = ['home', 'footer'] as const;
export type LANDING_PAGE_PLACEMENT = (typeof LANDING_PAGE_PLACEMENT)[number];

export class FindAllLandingPageUserDto extends LocaleDto {
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
