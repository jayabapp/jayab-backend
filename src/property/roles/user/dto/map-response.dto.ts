import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PublicMapPointDto {
  @ApiProperty() lat: number;
  @ApiProperty() lng: number;
  @ApiProperty({ enum: ['exact', 'approximate'] }) precision: 'exact' | 'approximate';
  @ApiProperty({ description: 'Zero for an exact point.' }) radius_m: number;
}

export class PropertyMapItemDto {
  @ApiProperty({ enum: ['property', 'cluster'] }) type: 'property' | 'cluster';

  @ApiProperty({
    description: 'Property id, or a display-only key for a cluster.',
    oneOf: [{ type: 'number' }, { type: 'string' }],
  })
  id: number | string;

  @ApiPropertyOptional() slug?: string;
  @ApiPropertyOptional({ type: PublicMapPointDto }) location?: PublicMapPointDto;
  @ApiPropertyOptional({ nullable: true, description: 'Tonight: discounted price when there is one.' })
  price?: number | null;
  @ApiPropertyOptional({ enum: ['today_nightly'] }) price_basis?: 'today_nightly';
  @ApiPropertyOptional({ enum: ['toman'] }) currency?: 'toman';
  @ApiPropertyOptional({ description: 'Cluster centre.' }) lat?: number;
  @ApiPropertyOptional({ description: 'Cluster centre.' }) lng?: number;
  @ApiPropertyOptional({ description: 'Listings inside the cluster.' }) count?: number;
  @ApiPropertyOptional({ type: [Number], description: 'west, south, east, north of the cluster members.' })
  bounds?: number[];
}

export class PropertyMapMetaDto {
  @ApiProperty({
    description: 'Located results in the box; equals the list total for the same filters and box.',
  })
  total: number;
  @ApiProperty() returned_items: number;
  @ApiProperty({ type: [Number] }) bbox: number[];
  @ApiProperty() zoom: number;
  @ApiProperty() is_clustered: boolean;
  @ApiProperty({ enum: [false] }) is_truncated: false;
  @ApiProperty({ enum: ['today_nightly'] }) price_basis: 'today_nightly';
  @ApiProperty({ enum: ['toman'] }) currency: 'toman';
}

export class PropertyMapResultDto {
  @ApiProperty({ type: [PropertyMapItemDto] }) items: PropertyMapItemDto[];
  @ApiProperty({ type: PropertyMapMetaDto }) meta: PropertyMapMetaDto;
}

export class PropertyMapResponseDto {
  @ApiProperty() status: string;
  @ApiProperty() messages: Record<string, string>;
  @ApiProperty({ type: PropertyMapResultDto }) data: PropertyMapResultDto;
}

export class PriceHistogramBinDto {
  @ApiProperty({ description: 'Inclusive.' }) from: number;
  @ApiProperty({ description: 'Exclusive, except for the last bin, which includes it.' }) to: number;
  @ApiProperty() count: number;
}

export class PriceHistogramDto {
  @ApiProperty({ type: [PriceHistogramBinDto] }) bins: PriceHistogramBinDto[];
  @ApiProperty({ nullable: true }) min: number | null;
  @ApiProperty({ nullable: true }) max: number | null;
  @ApiProperty({ description: 'Sum of every bin count.' }) total_priced: number;
  @ApiProperty({ enum: ['toman'] }) currency: 'toman';
}

export class PropertyPriceHistogramResponseDto {
  @ApiProperty() status: string;
  @ApiProperty() messages: Record<string, string>;
  @ApiProperty({ type: PriceHistogramDto }) data: PriceHistogramDto;
}
