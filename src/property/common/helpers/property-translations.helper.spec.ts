import { PropertyDescription } from '@prisma/client';
import { PropertySerializer, PropertyJsonType } from 'src/property/serializer/property.serializer';
import { DayColumn } from 'src/common/helpers/day.helper';
import { cleanEditions, localizeDescriptions, localizeHostName } from './property-translations.helper';

const description = {
  id: 1,
  property_id: 9,
  property_dscr: 'ویلای دنج',
  pet_dscr: 'ورود حیوان ممنوع است',
  doc_dscr: 'کارت ملی',
  other_dscr: null,
  translations: {
    en: { pet_dscr: ' Pets are not allowed ', doc_dscr: '   ', other_dscr: 'Quiet hours after 11pm' },
    ar: { property_dscr: 'فيلا هادئة' },
  },
} as unknown as PropertyDescription;

describe('property description and host translations', () => {
  it('keeps Persian for fa and never leaks the raw translations column', () => {
    const { value, locales } = localizeDescriptions(description, 'fa');
    expect(value).not.toHaveProperty('translations');
    expect(value.pet_dscr).toBe('ورود حیوان ممنوع است');
    expect(locales.pet_dscr).toBe('fa');
  });

  it('localizes per field and falls back to Persian for blank or missing editions', () => {
    const { value, locales } = localizeDescriptions(description, 'en');
    expect(value.pet_dscr).toBe('Pets are not allowed');
    expect(value.doc_dscr).toBe('کارت ملی');
    expect(value.property_dscr).toBe('ویلای دنج');
    expect(locales).toMatchObject({ pet_dscr: 'en', doc_dscr: 'fa', property_dscr: 'fa' });
  });

  it('does not invent text for empty Persian fields even when an edition exists', () => {
    const { value, locales } = localizeDescriptions(description, 'en');
    expect(value.other_dscr).toBeNull();
    expect(locales).not.toHaveProperty('other_dscr');
  });

  it('localizes the host name with a Persian fallback', () => {
    const translations = { en: { name: 'Ali Rezaei' } };
    expect(localizeHostName('علی رضایی', translations, 'en')).toEqual({ value: 'Ali Rezaei', locale: 'en' });
    expect(localizeHostName('علی رضایی', translations, 'ar')).toEqual({ value: 'علی رضایی', locale: 'fa' });
    expect(localizeHostName('علی رضایی', null, 'fa')).toEqual({ value: 'علی رضایی', locale: 'fa' });
  });

  it('cleanEditions drops blanks, unknown fields and empty editions', () => {
    expect(
      cleanEditions({ en: { name: ' Ali ', extra: 'x' }, ar: { name: '  ' } }, ['name']),
    ).toEqual({ en: { name: 'Ali' } });
    expect(cleanEditions({ en: { name: '' } }, ['name'])).toBeNull();
    expect(cleanEditions(undefined, ['name'])).toBeNull();
  });
});

describe('property options in the single-listing payload', () => {
  const serializer = new PropertySerializer();
  const property = {
    id: 9,
    code: '9',
    title: 'ویلا',
    slug: '9',
    calendar: [],
    daily_price: { normal: 1 },
    status: 1,
    description,
    property_options: [
      {
        option: {
          id: 5,
          title: 'استخر',
          group: 'WELFARE',
          image: null,
          translations: { en: { title: 'Pool' }, ar: { title: 'مسبح' } },
        },
      },
      { option: { id: 6, title: 'شهرکی', group: 'PATTERN', image: null, translations: null } },
      { option: { id: 7, title: 'ورود حیوان مجاز نیست', group: 'PET', image: null, translations: { en: { title: 'Pets not allowed' } } } },
    ],
  } as unknown as PropertyJsonType;

  it('translates titles but keeps the Persian canonical title and the option id', async () => {
    const res = await serializer.toJSON(property, DayColumn.normal, false, false, 'en');
    expect(res.option_items).toEqual([
      expect.objectContaining({ id: 5, title: 'Pool', canonical_title: 'استخر', title_locale: 'en' }),
      expect.objectContaining({ id: 6, title: 'شهرکی', canonical_title: 'شهرکی', title_locale: 'fa' }),
      expect.objectContaining({ id: 7, title: 'Pets not allowed', canonical_title: 'ورود حیوان مجاز نیست' }),
    ]);
    expect(res.options).toMatchObject({ welfare: ['Pool'], pattern: 'شهرکی', pet: 'Pets not allowed' });
  });

  it('exposes localized descriptions and their per-field locales', async () => {
    const res = await serializer.toJSON(property, DayColumn.normal, false, false, 'ar');
    expect(res.property_descriptions.property_dscr).toBe('فيلا هادئة');
    expect(res.description_locales).toMatchObject({ property_dscr: 'ar', pet_dscr: 'fa' });
  });
});
