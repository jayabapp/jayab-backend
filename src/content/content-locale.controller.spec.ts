import { INestApplication, ValidationPipe } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { ContentSharedController } from './shared.controller';
import { ContentSharedService } from './shared.service';
import validationOptions from '../common/utils/validation-options';

describe('content locale request and cache isolation', () => {
  let app: INestApplication;
  const findOneByKey = jest.fn(async (key: string, locale = 'fa') => ({ key, content_locale: locale }));

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [CacheModule.register()],
      controllers: [ContentSharedController],
      providers: [{ provide: ContentSharedService, useValue: { findOneByKey } }],
    }).compile();
    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe(validationOptions));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('keeps the default Persian request backward compatible', async () => {
    const response = await request(app.getHttpServer()).get('/contents/by-key/homeContent').expect(200);
    expect(response.body.result.content_locale).toBe('fa');
  });

  it('caches English and Arabic under different URLs', async () => {
    for (const locale of ['en', 'ar', 'en']) {
      const response = await request(app.getHttpServer())
        .get(`/contents/by-key/homeContent?locale=${locale}`)
        .expect(200);
      expect(response.body.result.content_locale).toBe(locale);
    }
    expect(findOneByKey.mock.calls.filter((call) => call[1] === 'en')).toHaveLength(1);
    expect(findOneByKey.mock.calls.filter((call) => call[1] === 'ar')).toHaveLength(1);
  });

  it.each(['de', '', 'en-US', 'en&locale=ar'])('rejects unsupported/ambiguous locale %s', async (locale) => {
    await request(app.getHttpServer()).get(`/contents/by-key/homeContent?locale=${locale}`).expect(422);
  });
});
