import { locationSearchPath } from './canonical-landing.helper';

describe('locationSearchPath', () => {
  it('prefers the city, falls back to the province, and gives up without either', () => {
    expect(locationSearchPath({ cityId: 12, provinceId: 3 })).toBe('rooms?cities=12');
    expect(locationSearchPath({ provinceId: 3 })).toBe('rooms?provinces=3');
    expect(locationSearchPath({})).toBeNull();
  });
});
