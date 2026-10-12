import { plainToInstance } from 'class-transformer';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentAdminService } from './admin.service';
import { CreateContentAdminDto } from './dto/create.dto';
import { UpdateContentAdminDto } from './dto/update.dto';

describe('CMS translation persistence', () => {
  const db = {
    content: {
      findFirst: jest.fn().mockResolvedValue(null),
      findUnique: jest.fn().mockResolvedValue({ key: 'terms' }),
      create: jest.fn().mockResolvedValue({ id: 114 }),
      update: jest.fn().mockResolvedValue({ id: 114 }),
    },
    contentAttachment: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
  };
  const service = new ContentAdminService(db as unknown as PrismaService);
  const translation = {
    title: 'Home content',
    small_text: 'Stays across Iran',
    full_text: 'Rent directly from hosts',
    html: '<p>Find your next stay.</p>',
    seo: { metaTitle: 'Stays across Iran', metaDescription: 'Find your next stay.' },
  };
  const body = { key: 'homeContent', title: 'محتوای خانه', slug: 'home', translations: { en: translation } };

  beforeEach(() => jest.clearAllMocks());

  it('stores nested DTO instances as JSON without overwriting the Persian fields', async () => {
    await service.create(plainToInstance(CreateContentAdminDto, body));
    const data = db.content.create.mock.calls[0][0].data;
    expect(data.translations).toEqual({ en: translation });
    expect(Object.getPrototypeOf(data.translations)).toBe(Object.prototype);
    expect(data.title).toBe(body.title);
  });

  it('updates a translated edition without changing its HTML or SEO content', async () => {
    await service.update(114, plainToInstance(UpdateContentAdminDto, body));
    expect(db.content.update.mock.calls[0][0].data.translations).toEqual(body.translations);
  });

  it('preserves translations when an older panel omits the new field', async () => {
    await service.update(114, plainToInstance(UpdateContentAdminDto, { ...body, translations: undefined }));
    expect(db.content.update.mock.calls[0][0].data).not.toHaveProperty('translations');
  });

  it('lets an editor explicitly remove editions with an empty map', async () => {
    await service.update(114, plainToInstance(UpdateContentAdminDto, { ...body, translations: {} }));
    expect(db.content.update.mock.calls[0][0].data.translations).toEqual({});
  });

  it.each(['', '   ', '<p><br></p>', '<p>&nbsp;</p>'])(
    'rejects an empty translated legal body: %s',
    async (html) => {
      const terms = { ...body, key: 'terms', translations: { en: { ...translation, html } } };
      await expect(service.create(plainToInstance(CreateContentAdminDto, terms))).rejects.toThrow(
        'CONTENT_TERMS_BODY_REQUIRED',
      );
      await expect(
        service.update(11, plainToInstance(UpdateContentAdminDto, { ...terms, key: undefined })),
      ).rejects.toThrow('CONTENT_TERMS_BODY_REQUIRED');
      expect(db.content.create).not.toHaveBeenCalled();
      expect(db.content.update).not.toHaveBeenCalled();
    },
  );

  it('stores a complete terms edition independently from the Persian legal document', async () => {
    const terms = { ...body, key: 'terms', html: '<p>قوانین اصلی</p>' };
    await service.update(11, plainToInstance(UpdateContentAdminDto, terms));
    const data = db.content.update.mock.calls[0][0].data;
    expect(data.html).toBe(terms.html);
    expect(data.translations.en.html).toBe(translation.html);
  });
});
