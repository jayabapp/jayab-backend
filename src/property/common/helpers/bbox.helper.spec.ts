import { isInsideBbox, parseBbox } from './bbox.helper';

describe('parseBbox', () => {
  it('reads west,south,east,north', () => {
    expect(parseBbox('51.2,35.5,51.6,35.9')).toEqual([51.2, 35.5, 51.6, 35.9]);
    expect(parseBbox(' -10 , -20 , 10 , 20 ')).toEqual([-10, -20, 10, 20]);
  });

  it.each([
    ['empty', ''],
    ['three numbers', '1,2,3'],
    ['five numbers', '1,2,3,4,5'],
    ['an empty segment', '1,,3,4'],
    ['NaN', 'NaN,2,3,4'],
    ['Infinity', '1,2,Infinity,4'],
    ['an exponent', '1e1,2,30,40'],
    ['a trailing dot', '1.,2,3,4'],
    ['text', 'a,b,c,d'],
  ])('rejects %s', (_label: string, value: string) => {
    expect(parseBbox(value)).toBeNull();
  });

  it('rejects inverted and empty boxes', () => {
    expect(parseBbox('52,35,51,36')).toBeNull();
    expect(parseBbox('51,36,52,35')).toBeNull();
    expect(parseBbox('51,35,51,36')).toBeNull();
    expect(parseBbox('51,35,52,35')).toBeNull();
  });

  it('rejects coordinates outside the supported range and antimeridian crossing', () => {
    expect(parseBbox('-181,0,10,10')).toBeNull();
    expect(parseBbox('0,0,181,10')).toBeNull();
    expect(parseBbox('0,-85.1,10,10')).toBeNull();
    expect(parseBbox('0,0,10,85.1')).toBeNull();
    expect(parseBbox('170,0,-170,10')).toBeNull();
  });

  it('rejects anything that is not a string', () => {
    expect(parseBbox(undefined)).toBeNull();
    expect(parseBbox(null)).toBeNull();
    expect(parseBbox([1, 2, 3, 4])).toBeNull();
  });
});

describe('isInsideBbox', () => {
  const box = [51, 35, 52, 36] as [number, number, number, number];

  it('includes the boundary and excludes outside points', () => {
    expect(isInsideBbox(35.5, 51.5, box)).toBe(true);
    expect(isInsideBbox(35, 51, box)).toBe(true);
    expect(isInsideBbox(36, 52, box)).toBe(true);
    expect(isInsideBbox(36.0001, 51.5, box)).toBe(false);
    expect(isInsideBbox(35.5, 52.0001, box)).toBe(false);
  });
});
