import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { localizeTitle, withTitleTranslations } from './title-translations.helper';
import { WithTitleTranslationsDto } from '../dto/title-translations.dto';
import { Locale } from '../dto/locale.dto';
import validationOptions from '../utils/validation-options';
import { PrismaService } from 'src/prisma/prisma.service';
import { LandingPageUserController } from 'src/landing-page/roles/user/user.controller';
import { LandingPageUserService } from 'src/landing-page/roles/user/user.service';
import { PropertyOptionUserController } from 'src/property-option/roles/user/user.controller';
import { PropertyOptionUserService } from 'src/property-option/roles/user/user.service';
import { LandingPageAdminService } from 'src/landing-page/roles/admin/admin.service';
import { PropertyOptionAdminService } from 'src/property-option/roles/admin/admin.service';
import { UpdateLandingPageAdminDto } from 'src/landing-page/roles/admin/dto/update.dto';
import { UpdatePropertyOptionAdminDto } from 'src/property-option/roles/admin/dto/update.dto';

const translations = { en: { title: 'Villa' }, ar: { title: 'فيلا' } };
const original = { id: 7, title: 'ویلا', url: 'villa', translations };

describe('localized home display titles', () => {
  it.each<Locale>(['fa', 'ar', 'en'])('selects %s without changing canonical identifiers', (locale) => {
    const result = localizeTitle(original, locale);
    expect(result).toEqual({
      id: 7,
      url: 'villa',
      title: locale === 'fa' ? 'ویلا' : translations[locale].title,
      title_locale: locale,
    });
    expect(result).not.toHaveProperty('translations');
    expect(original.title).toBe('ویلا');
  });

  it.each([null, {}, { en: { title: '  ' } }, { en: { title: 12 } }, { ar: { title: 'فيلا' } }])(
    'falls back to Persian for incomplete editions (%j)',
    (editions) => {
      expect(localizeTitle({ ...original, translations: editions }, 'en').title_locale).toBe('fa');
      expect(localizeTitle({ ...original, translations: editions }, 'en').title).toBe('ویلا');
    },
  );

  it('preserves omitted translations and supports explicit removal', () => {
    expect(withTitleTranslations({ title: 'ویلا' })).not.toHaveProperty('translations');
    expect(withTitleTranslations({ title: 'ویلا', translations: {} }).translations).toEqual({});
  });

  it.each([
    { en: {} },
    { en: { title: ' ' } },
    { ar: { title: 42 } },
    { en: [] },
    { en: { title: 'x'.repeat(201) } },
  ])('rejects invalid translated titles (%j)', async (editions) => {
    const dto = plainToInstance(WithTitleTranslationsDto, { translations: editions });
    expect((await validate(dto, { whitelist: true })).length).toBeGreaterThan(0);
  });

  it('trims titles and removes routing/publication fields from editions', async () => {
    const dto = plainToInstance(WithTitleTranslationsDto, {
      translations: {
        en: { title: ' Villa ', url: 'changed', id: 3, is_active: false },
        de: { title: 'Villa' },
      },
    });
    expect(await validate(dto, { whitelist: true })).toEqual([]);
    expect(withTitleTranslations(dto).translations).toEqual({ en: { title: 'Villa' } });
  });
});

describe('home section API locale and cache isolation', () => {
  let app: INestApplication;
  const landingFindMany = jest.fn(async () => [{ ...original, position: 'quick_search', image: null }]);
  const optionFindMany = jest.fn(async () => [{ ...original, group: 'PROPERTY_TYPE', image: null }]);

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [LandingPageUserController, PropertyOptionUserController],
      providers: [
        LandingPageUserService,
        PropertyOptionUserService,
        {
          provide: PrismaService,
          useValue: {
            landingPage: { findMany: landingFindMany },
            propertyOption: { findMany: optionFindMany },
          },
        },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(validationOptions));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each([
    ['/user/landing-pages?placement=home', 'quick_search'],
    ['/user/property-options?group[]=PROPERTY_TYPE', 'PROPERTY_TYPE'],
  ])('serves each language and caches it separately at %s', async (path, group) => {
    for (const locale of ['fa', 'en', 'ar', 'en'] as const) {
      const response = await request(app.getHttpServer()).get(`${path}&locale=${locale}`).expect(200);
      const item = response.body.result[group][0];
      expect(item.title).toBe(locale === 'fa' ? original.title : translations[locale].title);
      expect(item.title_locale).toBe(locale);
      expect(item).not.toHaveProperty('translations');
      expect(item.url).toBe('villa');
    }
    const calls = group === 'quick_search' ? landingFindMany : optionFindMany;
    expect(calls).toHaveBeenCalledTimes(3);
  });

  it.each(['/user/landing-pages?placement=home', '/user/property-options?group[]=PROPERTY_TYPE'])(
    'defaults to Persian and validates the locale for %s',
    async (path) => {
      const response = await request(app.getHttpServer()).get(path).expect(200);
      expect(Object.values(response.body.result)[0][0].title).toBe(original.title);
      for (const locale of ['de', '', 'en-US', 'en&locale=ar']) {
        await request(app.getHttpServer()).get(`${path}&locale=${locale}`).expect(422);
      }
    },
  );
});

describe('admin translated title persistence', () => {
  it.each(['landing', 'option'])('preserves Persian and omitted editions when editing %s', async (kind) => {
    const model = {
      findFirst: jest.fn().mockResolvedValue(null),
      update: jest.fn().mockResolvedValue(original),
    };
    const db = { landingPage: model, propertyOption: model } as unknown as PrismaService;
    const service = kind === 'landing' ? new LandingPageAdminService(db) : new PropertyOptionAdminService(db);
    const dto = { title: original.title, url: original.url } as UpdateLandingPageAdminDto &
      UpdatePropertyOptionAdminDto;
    await service.update(7, dto);
    expect(model.update.mock.calls[0][0].data).not.toHaveProperty('translations');
    await service.update(7, { ...dto, translations });
    expect(model.update.mock.calls[1][0].data).toEqual({ ...dto, translations });
    await service.update(7, { ...dto, translations: {} });
    expect(model.update.mock.calls[2][0].data.translations).toEqual({});
  });
});
