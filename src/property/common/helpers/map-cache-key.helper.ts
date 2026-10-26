import { createHash } from 'crypto';

export const MAP_ALGORITHM_VERSION = 1;

const IGNORED_KEYS = new Set([
  'page',
  'per_page',
  'skip',
  'sort_type',
  'count_only',
  'locale',
  'zoom',
  'bbox',
]);
const LIST_KEYS = new Set([
  'cities',
  'provinces',
  'regions',
  'property_type',
  'pattern',
  'ownership',
  'cool_heat',
  'welfare',
  'neighborhood',
  'kitchen',
  'guest_type',
  'party',
  'pet',
  'pool_type',
  'entertainment',
]);

type KeyInput = {
  zoom?: number;
  filters: object;
  bbox?: number[];
  locale?: string;
  priceDay: string;
  salt?: string | null;
  kind: 'map' | 'histogram';
};

const normalizeValue = (key: string, value: unknown): unknown => {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === 'string' && LIST_KEYS.has(key))
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)
      .sort((a, b) => Number(a) - Number(b) || a.localeCompare(b))
      .join(',');
  return value;
};

export const buildMapCacheKey = ({ kind, filters, bbox, zoom, locale, priceDay, salt }: KeyInput): string => {
  const record = filters as Record<string, unknown>;
  const normalized = Object.keys(record)
    .filter(
      (key) =>
        !IGNORED_KEYS.has(key) && record[key] !== undefined && record[key] !== null && record[key] !== '',
    )
    .sort()
    .map((key) => [key, normalizeValue(key, record[key])]);

  const digest = createHash('sha1')
    .update(
      JSON.stringify({
        normalized,
        bbox: bbox ?? null,
        zoom: zoom ?? null,
        locale: locale ?? 'fa',
        priceDay,
      }),
    )
    .digest('hex');
  const saltTag = createHash('sha256')
    .update(salt ?? '')
    .digest('hex')
    .slice(0, 8);
  return `property:${kind}:v${MAP_ALGORITHM_VERSION}:${saltTag}:${digest}`;
};
