import { createHmac } from 'crypto';

export const APPROX_LOCATION_RADIUS_M = 700;

const MIN_OFFSET_M = 200;
const OFFSET_SPREAD_M = 300;
const METERS_PER_DEGREE = 111_320;
const MIN_SALT_LENGTH = 16;

export type ApproxLocation = { lat: number; lng: number; radius_m: number };

const round3 = (value: number) => Math.round(value * 1000) / 1000;

export const buildApproxLocation = (
  propertyId: number,
  lat: number | null | undefined,
  lng: number | null | undefined,
  salt: string | null | undefined,
): ApproxLocation | null => {
  if (!salt || salt.length < MIN_SALT_LENGTH) return null;
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  if (Math.abs(lat) > 89 || Math.abs(lng) > 180) return null;

  const digest = createHmac('sha256', salt).update(String(propertyId)).digest();
  const angle = ((digest.readUInt32BE(0) % 360) * Math.PI) / 180;
  const distance = MIN_OFFSET_M + (digest.readUInt32BE(4) % OFFSET_SPREAD_M);

  const dLat = (distance * Math.cos(angle)) / METERS_PER_DEGREE;
  const dLng = (distance * Math.sin(angle)) / (METERS_PER_DEGREE * Math.cos((lat * Math.PI) / 180));

  return { lat: round3(lat + dLat), lng: round3(lng + dLng), radius_m: APPROX_LOCATION_RADIUS_M };
};
