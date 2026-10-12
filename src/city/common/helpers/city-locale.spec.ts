import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { getQueueToken } from '@nestjs/bull';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { localizeCityTree } from './city-locale.helper';
import { CityUserController } from '../../roles/user/user.controller';
import { CitySharedService } from '../../shared.service';
import { CityAdminService } from '../../roles/admin/city-admin.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { PropertyUserController } from 'src/property/roles/user/user.controller';
import { PropertyUserService } from 'src/property/roles/user/user.service';
import { PropertyOwnerService } from 'src/property/roles/owner/owner.service';
import { ProfileUserService } from 'src/profile/roles/user/profile-user.service';
import { CALL_LOG_QUEUE, VIEW_COUNT_QUEUE } from 'src/property/processors/queue-name.constants';
import validationOptions from 'src/common/utils/validation-options';

const city = {
  id: 1,
  slug: 'tehran',
  title: 'تهران',
  translations: { en: { title: 'Tehran' }, ar: { title: 'طهران' } },
  child: [
    {
      id: 2,
      title: 'تهران',
      translations: { en: { title: 'Tehran' } },
      child: [{ id: 3, title: 'پونک', translations: null }],
    },
  ],
};

describe('city translations', () => {
  it('localizes every tree level independently and preserves identifiers and fallback', () => {
    const result = localizeCityTree(city, 'ar');
    expect(result).toEqual({
      id: 1,
      slug: 'tehran',
      title: 'طهران',
      title_locale: 'ar',
      child: [
        { id: 2, title: 'تهران', title_locale: 'fa', child: [{ id: 3, title: 'پونک', title_locale: 'fa' }] },
      ],
    });
    expect(JSON.stringify(result)).not.toContain('translations');
    expect(city.title).toBe('تهران');
  });

  it('preserves omitted editions and clears only through an explicit map in admin updates', async () => {
    const update = jest.fn().mockResolvedValue(city);
    const service = new CityAdminService({
      city: { update, findUnique: jest.fn().mockResolvedValue(city) },
    } as unknown as PrismaService);
    for (const dto of [
      { title: city.title },
      { title: city.title, translations: city.translations },
      { title: city.title, translations: {} },
    ]) {
      await service.update(1, dto);
    }
    expect(update.mock.calls[0][0].data).not.toHaveProperty('translations');
    expect(update.mock.calls[1][0].data.translations).toEqual(city.translations);
    expect(update.mock.calls[2][0].data.translations).toEqual({});
  });
});

describe('public property and city locale API contracts', () => {
  let app: INestApplication;
  const cityFindMany = jest.fn().mockResolvedValue([city]);
  const propertyService = {
    findAll: jest.fn(async (dto) => ({ data: [{ title_locale: dto.locale ?? 'fa' }] })),
    findOne: jest.fn(async (_slug, _isAdvisor, locale) => ({ title_locale: locale ?? 'fa' })),
    findSimilar: jest.fn(async (_id, _limit, locale) => [{ title_locale: locale ?? 'fa' }]),
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [CityUserController, PropertyUserController],
      providers: [
        CitySharedService,
        { provide: PrismaService, useValue: { city: { findMany: cityFindMany } } },
        { provide: PropertyUserService, useValue: propertyService },
        {
          provide: ProfileUserService,
          useValue: { checkUserIsActiveAdvisor: jest.fn().mockResolvedValue({ isAdvisor: false }) },
        },
        { provide: PropertyOwnerService, useValue: {} },
        { provide: getQueueToken(CALL_LOG_QUEUE), useValue: { add: jest.fn() } },
        { provide: getQueueToken(VIEW_COUNT_QUEUE), useValue: { add: jest.fn() } },
      ],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(validationOptions));
    await app.init();
  });

  afterAll(async () => {
    await app?.close();
  });

  it.each(['/user/properties', '/user/properties/12345-villa', '/user/properties/17/similar'])(
    'forwards the validated locale at %s',
    async (path) => {
      for (const locale of ['fa', 'en', 'ar', 'en']) {
        const { body } = await request(app.getHttpServer()).get(`${path}?locale=${locale}`).expect(200);
        const item = Array.isArray(body.result) ? body.result[0] : (body.result.data?.[0] ?? body.result);
        expect(item.title_locale).toBe(locale);
      }
      if (path.endsWith('similar')) expect(propertyService.findSimilar).toHaveBeenCalledTimes(3);
    },
  );

  it.each(['/cities', '/cities/1'])('localizes nested city responses at %s', async (path) => {
    for (const locale of ['fa', 'en', 'ar', 'en']) {
      const { body } = await request(app.getHttpServer()).get(`${path}?locale=${locale}`).expect(200);
      expect(body.result[0].title).toBe(locale === 'fa' ? city.title : city.translations[locale].title);
      expect(body.result[0].child[0].child[0].title_locale).toBe('fa');
      expect(JSON.stringify(body)).not.toContain('translations');
    }
    if (path === '/cities') expect(cityFindMany).toHaveBeenCalledTimes(3);
  });

  it.each([
    '/user/properties',
    '/user/properties/12345-villa',
    '/user/properties/17/similar',
    '/cities',
    '/cities/1',
  ])('defaults to Persian and rejects unsupported or repeated locales at %s', async (path) => {
    await request(app.getHttpServer()).get(path).expect(200);
    for (const locale of ['de', '', 'en-US', 'en&locale=ar']) {
      await request(app.getHttpServer()).get(`${path}?locale=${locale}`).expect(422);
    }
  });
});
