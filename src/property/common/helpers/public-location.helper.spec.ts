import { APPROX_LOCATION_RADIUS_M, buildApproxLocation } from './approx-location.helper';
import { buildPublicLocation } from './public-location.helper';

const SALT = 'unit-test-salt-0123456789';

describe('buildPublicLocation', () => {
  it('returns the exact point only when the owner made the location public', () => {
    expect(buildPublicLocation({ id: 1, lat: 36.7, lng: 52.6, is_location_visible: true }, SALT)).toEqual({
      lat: 36.7,
      lng: 52.6,
      precision: 'exact',
      radius_m: 0,
    });
  });

  it('returns the approximate point for a hidden location, matching the detail page rule', () => {
    const hidden = buildPublicLocation({ id: 7, lat: 36.7, lng: 52.6, is_location_visible: false }, SALT);
    const approx = buildApproxLocation(7, 36.7, 52.6, SALT);
    expect(hidden).toEqual({
      lat: approx.lat,
      lng: approx.lng,
      precision: 'approximate',
      radius_m: APPROX_LOCATION_RADIUS_M,
    });
    expect(hidden).not.toMatchObject({ lat: 36.7, lng: 52.6 });
  });

  it('treats an unset visibility as hidden', () => {
    expect(
      buildPublicLocation({ id: 7, lat: 36.7, lng: 52.6, is_location_visible: null }, SALT),
    ).toMatchObject({ precision: 'approximate' });
    expect(buildPublicLocation({ id: 7, lat: 36.7, lng: 52.6 }, SALT)).toMatchObject({
      precision: 'approximate',
    });
  });

  it('never falls back to the real point when the salt is missing or too short', () => {
    for (const salt of [undefined, null, '', 'short']) {
      expect(
        buildPublicLocation({ id: 7, lat: 36.7, lng: 52.6, is_location_visible: false }, salt),
      ).toBeNull();
    }
  });

  it('still serves a public exact point without a salt, since it needs none', () => {
    expect(
      buildPublicLocation({ id: 7, lat: 36.7, lng: 52.6, is_location_visible: true }, undefined),
    ).toMatchObject({ precision: 'exact' });
  });

  it('gives nothing for empty or invalid coordinates, public or not', () => {
    for (const visible of [true, false]) {
      for (const [lat, lng] of [
        [null, 52.6],
        [36.7, undefined],
        [Number.NaN, 52.6],
        [36.7, Number.POSITIVE_INFINITY],
        [95, 52.6],
        [36.7, 190],
      ] as [number, number][]) {
        expect(buildPublicLocation({ id: 1, lat, lng, is_location_visible: visible }, SALT)).toBeNull();
      }
    }
  });
});
