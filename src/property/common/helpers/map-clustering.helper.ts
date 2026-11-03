import { PublicMapPoint } from './public-location.helper';

export const MAP_MAX_ITEMS = 300;
export const MAP_MIN_ZOOM = 2;
export const MAP_MAX_ZOOM = 19;
const CELL_DEGREES_AT_ZOOM_0 = 84;
const COORDINATE_DECIMALS = 6;

export type MapPointInput = {
  id: number;
  slug: string;
  price: number | null;
  favorite_count: number;
  location: PublicMapPoint;
};

export type MapPropertyItem = {
  id: number;
  slug: string;
  type: 'property';
  currency: 'toman';
  price: number | null;
  favorite_count: number;
  location: PublicMapPoint;
  price_basis: 'today_nightly';
};

export type MapClusterItem = {
  id: string;
  lat: number;
  lng: number;
  count: number;
  type: 'cluster';
  bounds: [number, number, number, number];
};

export type MapItem = MapPropertyItem | MapClusterItem;

const round = (value: number): number => Number(value.toFixed(COORDINATE_DECIMALS));

const toPropertyItem = ({ id, slug, location, price, favorite_count }: MapPointInput): MapPropertyItem => ({
  type: 'property',
  id,
  slug,
  location,
  price,
  favorite_count,
  price_basis: 'today_nightly',
  currency: 'toman',
});

const toClusterItem = (id: string, members: MapPointInput[]): MapClusterItem => {
  let latSum = 0;
  let lngSum = 0;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const { location } of members) {
    latSum += location.lat;
    lngSum += location.lng;
    west = Math.min(west, location.lng);
    east = Math.max(east, location.lng);
    south = Math.min(south, location.lat);
    north = Math.max(north, location.lat);
  }
  return {
    type: 'cluster',
    id,
    lat: round(latSum / members.length),
    lng: round(lngSum / members.length),
    count: members.length,
    bounds: [west, south, east, north],
  };
};

const groupBy = (points: MapPointInput[], keyOf: (point: MapPointInput) => string) => {
  const groups = new Map<string, MapPointInput[]>();
  for (const point of points) {
    const key = keyOf(point);
    const group = groups.get(key);
    if (group) group.push(point);
    else groups.set(key, [point]);
  }
  return groups;
};

const sameSpot = ({ location }: MapPointInput) =>
  `${location.lat.toFixed(COORDINATE_DECIMALS)}:${location.lng.toFixed(COORDINATE_DECIMALS)}`;

const cellOf = (cell: number) => (point: MapPointInput) =>
  `${Math.floor((point.location.lng + 180) / cell)}:${Math.floor((point.location.lat + 90) / cell)}`;

const startingCell = (zoom: number) => CELL_DEGREES_AT_ZOOM_0 / 2 ** Math.min(Math.max(zoom, 0), 22);

export const buildMapItems = (
  points: MapPointInput[],
  zoom: number,
  maxItems: number = MAP_MAX_ITEMS,
): MapItem[] => {
  if (points.length === 0) return [];

  let cell: number | null = null;
  let groups: Map<string, MapPointInput[]>;
  if (points.length <= maxItems) {
    groups = groupBy(points, sameSpot);
  } else {
    cell = startingCell(zoom);
    groups = groupBy(points, cellOf(cell));
    while (groups.size > maxItems) {
      cell *= 2;
      groups = groupBy(points, cellOf(cell));
    }
  }

  const properties: MapPropertyItem[] = [];
  const clusters: MapClusterItem[] = [];
  for (const [key, members] of groups) {
    if (members.length === 1) properties.push(toPropertyItem(members[0]));
    else clusters.push(toClusterItem(cell === null ? `at:${key}` : `grid:${cell}:${key}`, members));
  }

  properties.sort((a, b) => a.id - b.id);
  clusters.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return [...properties, ...clusters];
};

export const countMapItems = (items: MapItem[]): number =>
  items.reduce((total, item) => total + (item.type === 'cluster' ? item.count : 1), 0);
