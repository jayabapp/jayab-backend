import { Content } from '@prisma/client';
import { readFileSync } from 'fs';
import { join } from 'path';
import { localizeContent } from './content-locale.serializer';

const migration = readFileSync(
  join(__dirname, '../../../prisma/migrations/20261011090000_add_content_translations/migration.sql'),
  'utf8',
);
const editions = JSON.parse(migration.split('$translations$')[1]);

const base: Content = {
  id: 114,
  key: 'homeContent',
  title: 'محتوای خانه',
  small_text: 'عنوان فارسی',
  full_text: 'شعار فارسی',
  html: '<p>متن فارسی</p>',
  seo: { metaTitle: 'سئوی فارسی', metaDescription: 'توضیحات فارسی', canonicalURL: 'https://jayab.org/' },
  translations: editions,
  slug: 'home',
  feature_image_id: null,
  is_active: true,
  category_id: null,
  order: null,
  view_count: 0,
  link: null,
  video_id: null,
  show_in_sitemap: true,
  fields: null,
  form_id: null,
  created_at: new Date(0),
  updated_at: new Date(0),
  published_at: null,
};

describe('localized CMS content', () => {
  it('preserves the existing Persian content and does not expose other editions publicly', () => {
    const result = localizeContent(base);
    expect(result.full_text).toBe(base.full_text);
    expect(result.html).toBe(base.html);
    expect(result.seo).toEqual(base.seo);
    expect(result.content_locale).toBe('fa');
    expect(result).not.toHaveProperty('translations');
  });

  it.each(['ar', 'en'] as const)('resolves the complete %s edition seeded by the migration', (locale) => {
    const result = localizeContent(base, locale);
    expect(result.content_locale).toBe(locale);
    expect(result.full_text).toBe(editions[locale].full_text);
    expect(result.html).toBe(editions[locale].html);
    expect(result.small_text).toBe(editions[locale].small_text);
    expect(result.html.match(/<h2>/g)).toHaveLength(5);
    expect(result.seo).toEqual({ ...editions[locale].seo, canonicalURL: 'https://jayab.org/' });
  });

  it('does not mix languages when an edition is incomplete or malformed', () => {
    for (const translations of [null, {}, { en: [] }, { en: { ...editions.en, full_text: ' ' } }]) {
      const result = localizeContent({ ...base, translations }, 'en');
      expect(result.content_locale).toBe('fa');
      expect(result.full_text).toBe(base.full_text);
      expect(result.html).toBe(base.html);
    }
  });

  it('uses an intentional empty translated article instead of falling back to Persian', () => {
    const result = localizeContent({ ...base, translations: { en: { ...editions.en, html: '' } } }, 'en');
    expect(result.content_locale).toBe('en');
    expect(result.html).toBe('');
  });

  it('does not mutate the database row while serving different languages', () => {
    const before = JSON.stringify(base);
    localizeContent(base, 'en');
    localizeContent(base, 'ar');
    expect(JSON.stringify(base)).toBe(before);
  });
});
