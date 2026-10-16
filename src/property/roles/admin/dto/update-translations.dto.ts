import { IsObject, IsOptional, ValidateNested } from 'class-validator';
import { _IsString, _MaxLength } from 'src/common/pipes/validator-translate.pipe';
import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyTranslationsDto } from 'src/property/common/dto/property-translations.dto';

const trim = ({ value }) => (typeof value === 'string' ? value.trim() : value);

/** Every field is optional and may be blank: blank means "no translation" and is dropped on save. */
export class DescriptionEditionDto {
  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  property_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  ad_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  facility_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  pattern_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  distance_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  guest_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  pet_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  party_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  doc_dscr?: string;

  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(1024)
  @IsOptional()
  other_dscr?: string;
}

export class DescriptionTranslationsDto {
  @ApiProperty({ required: false, type: DescriptionEditionDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DescriptionEditionDto)
  ar?: DescriptionEditionDto;

  @ApiProperty({ required: false, type: DescriptionEditionDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DescriptionEditionDto)
  en?: DescriptionEditionDto;
}

export class HostEditionDto {
  @ApiProperty({ required: false })
  @Transform(trim)
  @_IsString()
  @_MaxLength(64)
  @IsOptional()
  name?: string;
}

export class HostTranslationsDto {
  @ApiProperty({ required: false, type: HostEditionDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HostEditionDto)
  ar?: HostEditionDto;

  @ApiProperty({ required: false, type: HostEditionDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HostEditionDto)
  en?: HostEditionDto;
}

export class UpdatePropertyTranslationsAdminDto {
  @ApiProperty({ required: false, type: PropertyTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => PropertyTranslationsDto)
  main?: PropertyTranslationsDto;

  @ApiProperty({ required: false, type: DescriptionTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => DescriptionTranslationsDto)
  descriptions?: DescriptionTranslationsDto;

  @ApiProperty({ required: false, type: HostTranslationsDto })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => HostTranslationsDto)
  host?: HostTranslationsDto;
}
