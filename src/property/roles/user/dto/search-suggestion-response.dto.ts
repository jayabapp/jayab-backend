import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum SearchSuggestionType {
  PROPERTY = 'property',
  CITY = 'city',
  REGION = 'region',
  PROVINCE = 'province',
  LANDING = 'landing',
}

export class SearchSuggestionItemDto {
  @ApiProperty({ enum: SearchSuggestionType })
  type: SearchSuggestionType;

  @ApiProperty()
  id: number;

  @ApiProperty()
  label: string;

  @ApiProperty({ description: 'Same-origin navigation target' })
  target: string;

  @ApiPropertyOptional()
  parentLabel?: string;
}

export class SearchSuggestionsResponseDto {
  @ApiProperty({ type: [Object], description: 'Legacy-compatible property group' })
  properties: Array<{ id: number; title: string; slug: string }>;

  @ApiProperty({ type: [Object], description: 'Legacy-compatible city group' })
  cities: Array<Record<string, unknown>>;

  @ApiProperty({ type: [Object], description: 'Legacy-compatible landing group' })
  landings: Array<{ id: number; title: string; url: string }>;

  @ApiProperty({ type: [SearchSuggestionItemDto] })
  items: SearchSuggestionItemDto[];
}

export class SearchSuggestionsSuccessResponseDto {
  @ApiProperty({ enum: ['successful'] })
  status: 'successful';

  @ApiProperty({ example: {} })
  messages: { fa: string | null };

  @ApiProperty({ type: SearchSuggestionsResponseDto })
  data: SearchSuggestionsResponseDto;
}
