export type SearchCityListItem = {
  id: number;
  title: string;
  parent_title?: string;
  grandparent_id?: number;
  parent_id: number | null;
  grandparent_title?: string;
  level: 'province' | 'city' | 'region';
};

export type SearchExtractProperty = {
  id: number;
  code: string;
  slug: string | null;
  title: string | null;
};

export type SearchExtractResult = {
  matched_order: string[];
  ignored_terms: string[];
  landing_url: string | null;
  cities_list: SearchCityListItem[];
  property: SearchExtractProperty | null;
  client_query: Record<string, string | number>;
};
