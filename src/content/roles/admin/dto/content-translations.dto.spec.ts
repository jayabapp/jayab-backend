import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ContentTranslationsDto } from './content-translations.dto';

const migration = readFileSync(
  join(__dirname, '../../../../../prisma/migrations/20261011090000_add_content_translations/migration.sql'),
  'utf8',
);
const editions = JSON.parse(migration.split('$translations$')[1]);

describe('content translation validation', () => {
  const check = (input: unknown): ReturnType<typeof validate> =>
    validate(plainToInstance(ContentTranslationsDto, input), { whitelist: true });

  it('accepts both seeded editions and an empty optional translation map', async () => {
    expect(await check(editions)).toEqual([]);
    expect(await check({})).toEqual([]);
  });

  it('rejects missing fields, objects/arrays as text, and invalid nested SEO', async () => {
    for (const en of [
      {},
      { ...editions.en, title: 42 },
      { ...editions.en, full_text: '   ' },
      { ...editions.en, html: ['text'] },
      { ...editions.en, seo: { metaTitle: 'title' } },
      { ...editions.en, seo: 'not an object' },
    ]) {
      expect((await check({ en })).length).toBeGreaterThan(0);
    }
  });

  it('whitelists translation fields so page routing and publication cannot be changed through them', async () => {
    const dto = plainToInstance(ContentTranslationsDto, {
      de: editions.en,
      en: {
        ...editions.en,
        slug: 'changed',
        is_active: false,
        seo: { ...editions.en.seo, canonicalURL: 'https://example.com' },
      },
    });
    expect(await validate(dto, { whitelist: true })).toEqual([]);
    expect(dto).not.toHaveProperty('de');
    expect(dto.en).not.toHaveProperty('slug');
    expect(dto.en.seo).not.toHaveProperty('canonicalURL');
  });
});
