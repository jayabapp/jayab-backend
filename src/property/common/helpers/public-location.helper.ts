import { buildApproxLocation } from './approx-location.helper';

export type PublicMapPoint = {
  lat: number;
  lng: number;
  radius_m: number;
  precision: 'exact' | 'approximate';
};

type LocatedProperty = {
  id: number;
  lat?: number | null;
  lng?: number | null;
  is_location_visible?: boolean | null;
};

const isUsable = (lat: unknown, lng: unknown): lat is number =>
  typeof lat === 'number' &&
  typeof lng === 'number' &&
  Number.isFinite(lat) &&
  Number.isFinite(lng) &&
  Math.abs(lat) <= 89 &&
  Math.abs(lng) <= 180;

export const buildPublicLocation = (
  property: LocatedProperty,
  salt: string | null | undefined,
): PublicMapPoint | null => {
  const { lat, lng } = property;
  if (!isUsable(lat, lng)) return null;
  if (property.is_location_visible === true) return { lat, lng, precision: 'exact', radius_m: 0 };
  const approx = buildApproxLocation(property.id, lat, lng, salt);
  return approx
    ? { lat: approx.lat, lng: approx.lng, precision: 'approximate', radius_m: approx.radius_m }
    : null;
};
