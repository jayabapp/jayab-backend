import { plainToInstance } from 'class-transformer';
import { FindAllPropertyUserDto } from './find-all.dto';
import { PropertyMapUserDto } from './map.dto';

describe('discovery boolean query flags', () => {
  it.each(['has_blue_tick', 'is_authorized'])(
    'keeps an explicit %s=0 disabled in both list and map queries',
    (key) => {
      for (const dto of [
        plainToInstance(FindAllPropertyUserDto, { [key]: '0', is_premium: '1' }),
        plainToInstance(PropertyMapUserDto, { [key]: '0', bbox: '51,35,52,36', zoom: '12' }),
      ])
        expect(dto[key]).toBe(false);
      expect(plainToInstance(FindAllPropertyUserDto, { [key]: '1' })[key]).toBe(true);
      expect(plainToInstance(FindAllPropertyUserDto, {})[key]).toBeUndefined();
    },
  );
});
