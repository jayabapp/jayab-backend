import { DayColumn } from 'src/common/helpers/day.helper';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Property } from '@prisma/client';
import { PropertyJsonType, PropertySerializer } from './property.serializer';
import { PropertyTranslationsDto } from '../common/dto/property-translations.dto';
import { PropertyOwnerService } from '../roles/owner/owner.service';
import { UpdatePropertyStepOneOwnerDto } from '../roles/owner/dto/update-property.dto';
import { PropertyStatuses } from '../common/types/property-status.type';
import { PrismaService } from 'src/prisma/prisma.service';

const translatedPropertyFixture = {
  id: 17,
  code: '12345',
  title: 'ویلا در تهران',
  slug: '12345-ویلا-در-تهران',
  address: 'آدرس خصوصی فارسی',
  translations: {
    en: { title: 'Villa in Tehran', address: 'Private English address' },
    ar: { title: 'فيلا في طهران' },
  },
  city: { title: 'تهران', translations: { en: { title: 'Tehran' }, ar: { title: 'طهران' } } },
  province: { title: 'تهران', translations: { en: { title: 'Tehran' }, ar: { title: 'طهران' } } },
  region: { title: 'پونک', translations: { en: { title: 'Punak' } } },
  calendar: [],
  daily_price: {
    id: 3,
    property_id: 17,
    normal: 500000,
    friday: 600000,
    cleaning: 100000,
    additional_person: 200000,
  },
  status: PropertyStatuses.PUBLISHED,
  is_location_visible: false,
  lat: 35.7,
  lng: 51.4,
} as unknown as PropertyJsonType;

describe('property text localization and location privacy', () => {
  const serializer = new PropertySerializer();

  it.each(['fa', 'en', 'ar'] as const)(
    'localizes %s while preserving IDs, URLs and prices',
    async (locale) => {
      const [result] = await serializer.toArray(
        [translatedPropertyFixture],
        DayColumn.normal,
        false,
        false,
        locale,
      );
      expect(result.title).toBe(
        locale === 'fa' ? 'ویلا در تهران' : translatedPropertyFixture.translations[locale].title,
      );
      expect(result.city).toBe(locale === 'fa' ? 'تهران' : locale === 'en' ? 'Tehran' : 'طهران');
      expect(result.region).toBe(locale === 'en' ? 'Punak' : 'پونک');
      expect(result.text_locales.region).toBe(locale === 'en' ? 'en' : 'fa');
      expect(result).toMatchObject({
        id: 17,
        code: '12345',
        slug: translatedPropertyFixture.slug,
        minimum_price: 500000,
      });
      expect(result.today_price.price).toBe(500000);
      expect(result).not.toHaveProperty('translations');
      expect(result).not.toHaveProperty('address');
      expect(result.text_locales).not.toHaveProperty('address');
    },
  );

  it.each(['fa', 'en', 'ar'] as const)(
    'never exposes a private address or coordinates in %s',
    async (locale) => {
      const result = await serializer.toJSON(
        translatedPropertyFixture,
        DayColumn.normal,
        true,
        false,
        locale,
      );
      expect(result.address).toBeNull();
      expect(result.latitude).toBeNull();
      expect(result.longitude).toBeNull();
      expect(result.text_locales).not.toHaveProperty('address');
      expect(JSON.stringify(result)).not.toContain('Private English address');
      expect(JSON.stringify(result)).not.toContain('آدرس خصوصی فارسی');
    },
  );

  it('uses the same visibility rule for the translated address and the original', async () => {
    const visible = await serializer.toJSON(
      { ...translatedPropertyFixture, is_location_visible: true },
      DayColumn.normal,
      false,
      false,
      'en',
    );
    const owner = await serializer.toJSON(translatedPropertyFixture, DayColumn.normal, false, true, 'en');
    for (const result of [visible, owner]) {
      expect(result.address).toBe('Private English address');
      expect(result.text_locales.address).toBe('en');
      expect(result.latitude).toBe(35.7);
    }
    const fallback = await serializer.toJSON(translatedPropertyFixture, DayColumn.normal, false, true, 'ar');
    expect(fallback.title).toBe('فيلا في طهران');
    expect(fallback.address).toBe('آدرس خصوصی فارسی');
    expect(fallback.text_locales.address).toBe('fa');
  });

  it('falls back per field for missing, empty or malformed editions', async () => {
    for (const translations of [null, {}, { en: { title: ' ', address: 10 } }]) {
      const result = await serializer.toJSON(
        { ...translatedPropertyFixture, translations },
        DayColumn.normal,
        false,
        true,
        'en',
      );
      expect(result.title).toBe('ویلا در تهران');
      expect(result.address).toBe('آدرس خصوصی فارسی');
      expect(result.text_locales.title).toBe('fa');
    }
  });
});

describe('property translation validation', () => {
  it.each([
    { en: [] },
    { en: { title: ' ' } },
    { ar: { address: 10 } },
    { en: { title: 'x'.repeat(201) } },
    { ar: { address: 'x'.repeat(1001) } },
  ])('rejects malformed input (%j)', async (translations) => {
    const dto = plainToInstance(PropertyTranslationsDto, translations);
    expect((await validate(dto, { whitelist: true })).length).toBeGreaterThan(0);
  });

  it('accepts independent fields, trims them and removes canonical/routing fields', async () => {
    const dto = plainToInstance(PropertyTranslationsDto, {
      en: { title: ' Villa ', slug: 'changed', city_id: 12 },
      ar: { address: ' عنوان خاص ' },
      fa: { title: 'جایگزین' },
    });
    expect(await validate(dto, { whitelist: true })).toEqual([]);
    expect(JSON.parse(JSON.stringify(dto))).toEqual({ en: { title: 'Villa' }, ar: { address: 'عنوان خاص' } });
  });
});

describe('owner translation protection', () => {
  it('ignores owner-supplied editions and builds the slug from Persian', async () => {
    const update = jest.fn().mockResolvedValue({});
    const db = {
      property: { update },
      city: { findUnique: jest.fn().mockResolvedValue({ _count: { child: 0 } }) },
    } as unknown as PrismaService;
    const service = new PropertyOwnerService(null, db, null, null, new PropertySerializer(), null, null);
    jest.spyOn(service as any, 'deleteAndCreateNewOption').mockResolvedValue({ options: [], numericIds: [] });
    const dto = {
      title: 'ویلا در تهران',
      address: 'آدرس خصوصی فارسی',
      city_id: 1,
    } as UpdatePropertyStepOneOwnerDto;
    for (const payload of [
      dto,
      { ...dto, translations: translatedPropertyFixture.translations } as UpdatePropertyStepOneOwnerDto,
      { ...dto, translations: {} },
    ]) {
      await service.updateInit(translatedPropertyFixture as Property, payload);
    }
    for (const [call] of update.mock.calls) {
      expect(call.data).not.toHaveProperty('translations');
    }
    for (const [call] of update.mock.calls) {
      expect(call.data.title).toBe(dto.title);
      expect(call.data.address).toBe(dto.address);
      expect(call.data.slug).toBe(translatedPropertyFixture.slug);
    }
  });
});
