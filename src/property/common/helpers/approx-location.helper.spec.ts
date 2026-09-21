import { APPROX_LOCATION_RADIUS_M, buildApproxLocation } from './approx-location.helper';

const SALT = 'unit-test-salt-0123456789';
const EARTH_RADIUS_M = 6_371_000;

const distanceM = (aLat: number, aLng: number, bLat: number, bLng: number) => {
  const rad = (v: number) => (v * Math.PI) / 180;
  const h =
    Math.sin(rad(bLat - aLat) / 2) ** 2 +
    Math.cos(rad(aLat)) * Math.cos(rad(bLat)) * Math.sin(rad(bLng - aLng) / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(h));
};

describe('buildApproxLocation', () => {
  it('returns the same point for the same property and salt', () => {
    expect(buildApproxLocation(11214, 36.7025, 52.6512, SALT)).toEqual(
      buildApproxLocation(11214, 36.7025, 52.6512, SALT),
    );
  });

  it('never returns the real coordinates but keeps them inside the circle', () => {
    for (let id = 1; id <= 500; id++) {
      const lat = 25 + (id % 14) + 0.123456;
      const lng = 45 + (id % 18) + 0.654321;
      const approx = buildApproxLocation(id, lat, lng, SALT);
      expect(approx).not.toBeNull();
      const gap = distanceM(lat, lng, approx.lat, approx.lng);
      expect(gap).toBeGreaterThan(100);
      expect(gap).toBeLessThan(APPROX_LOCATION_RADIUS_M);
      expect(approx.radius_m).toBe(APPROX_LOCATION_RADIUS_M);
    }
  });

  it('rounds to three decimals', () => {
    const approx = buildApproxLocation(7, 35.767, 51.37, SALT);
    expect(approx.lat).toBe(Math.round(approx.lat * 1000) / 1000);
    expect(approx.lng).toBe(Math.round(approx.lng * 1000) / 1000);
  });

  it('differs between properties and between salts', () => {
    const a = buildApproxLocation(1, 36.7, 52.6, SALT);
    expect(buildApproxLocation(2, 36.7, 52.6, SALT)).not.toEqual(a);
    expect(buildApproxLocation(1, 36.7, 52.6, 'another-salt-0123456789')).not.toEqual(a);
  });

  it('fails closed on a missing or short salt and on unusable coordinates', () => {
    expect(buildApproxLocation(1, 36.7, 52.6, undefined)).toBeNull();
    expect(buildApproxLocation(1, 36.7, 52.6, 'short')).toBeNull();
    expect(buildApproxLocation(1, null, 52.6, SALT)).toBeNull();
    expect(buildApproxLocation(1, 36.7, undefined, SALT)).toBeNull();
    expect(buildApproxLocation(1, Number.NaN, 52.6, SALT)).toBeNull();
    expect(buildApproxLocation(1, 95, 52.6, SALT)).toBeNull();
  });
});
