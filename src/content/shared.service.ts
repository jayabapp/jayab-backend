import { Attachment, Content, ContentCategory, Prisma } from '@prisma/client';
import { localizeContent, LocalizedContent } from './serializer/content-locale.serializer';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { FindAllContentSharedDto } from './dto/find-all.dto';
import { localizeCategory } from 'src/content-category/common/helpers/category-translations.helper';
import { PrismaService } from 'src/prisma/prisma.service';
import { ContentLocale } from './dto/content-locale.dto';

@Injectable()
export class ContentSharedService {
  constructor(private readonly db: PrismaService) {}

  private publishedContentWhere(): Prisma.ContentWhereInput {
    return {
      is_active: true,
      OR: [{ published_at: null }, { published_at: { lte: new Date() } }],
    };
  }

  async findAll(dto: FindAllContentSharedDto): Promise<
    PaginatedResult<LocalizedContent<Content>> & {
      subcategories: Array<ContentCategory & { image: Attachment }>;
    }
  > {
    const { page, per_page: perPage, key } = dto;

    const category = await this.db.contentCategory.findFirst({
      where: { key },
      include: {
        child: { include: { image: true } },
      },
    });
    if (!category) throw new NotFoundException('دسته بندی مورد نظر یافت نشد');
    const andWhere: Prisma.ContentWhereInput[] = [
      this.publishedContentWhere(),
      { category_id: { in: [category.id, ...category.child.map((item) => item.id)] } },
    ];
    if (dto.q && typeof dto.q === 'string') {
      const titles = dto.q.split(' ').filter(Boolean);
      const titleQuery: Prisma.ContentWhereInput[] = [];
      titles.map((e) => {
        titleQuery.push({ title: { contains: e, mode: 'insensitive' } });
      });
      if (titleQuery.length) andWhere.push({ OR: titleQuery });
    }

    const query: Prisma.ContentFindManyArgs = dto.summary
      ? {
          where: { AND: andWhere },
          select: {
            id: true,
            title: true,
            slug: true,
            small_text: true,
            key: true,
            seo: true,
            translations: true,
            feature_image: true,
            view_count: true,
            created_at: true,
            category: { select: { id: true, title: true, slug: true, translations: true } },
          },
          orderBy: [{ order: { sort: 'asc', nulls: 'last' } }, { created_at: 'desc' }],
        }
      : {
          where: { AND: andWhere },
          include: {
            category: { include: { parent: true, image: true } },
            feature_image: true,
            attachments: { include: { attachment: true } },
            video: true,
          },
          orderBy: [{ order: { sort: 'asc', nulls: 'last' } }, { created_at: 'desc' }],
        };

    const list = await paginate()<Content, Prisma.ContentFindManyArgs>(this.db.content, query, {
      page,
      perPage,
    });

    return {
      data: list.data.map((item) =>
        localizeContent({ ...item, category: localizeCategory(item['category'], dto.locale) }, dto.locale),
      ),
      meta: list.meta,
      subcategories: category.child || [],
    };
  }

  async findOne(contentId: number): Promise<Content> {
    const item = await this.db.content.findFirst({
      where: { id: contentId, AND: [this.publishedContentWhere()] },
      include: {
        category: {
          include: {
            parent: true,
            image: true,
          },
        },
        feature_image: true,
        attachments: { include: { attachment: true } },
        video: true,
        forms: { orderBy: { sort_order: { sort: 'asc', nulls: 'last' } } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND_CONTENT');
    return item;
  }

  async findOneByKey(key: string, locale: ContentLocale = 'fa'): Promise<LocalizedContent<Content>> {
    const item = await this.db.content.findFirst({
      where: { key: `${key}`, AND: [this.publishedContentWhere()] },
      include: {
        category: true,
        feature_image: true,
        video: true,
        attachments: { include: { attachment: true } },
        forms: { orderBy: { sort_order: { sort: 'asc', nulls: 'last' } } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND_CONTENT');

    return localizeContent({ ...item, category: localizeCategory(item.category, locale) }, locale);
  }

  async findOneBySlug(slug: string): Promise<Content> {
    const item = await this.db.content.findFirst({
      where: { slug, AND: [this.publishedContentWhere()] },
      include: {
        category: {
          include: {
            parent: true,
            image: true,
          },
        },
        feature_image: true,
        attachments: { include: { attachment: true } },
        video: true,
        forms: { orderBy: { sort_order: { sort: 'asc', nulls: 'last' } } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');
    void this.db.content
      .update({ where: { id: item.id }, data: { view_count: { increment: 1 } } })
      .catch(() => undefined);
    return item;
  }

  async findOneCategory(categoryKey: string, locale: ContentLocale = 'fa'): Promise<ContentCategory> {
    const item = await this.db.contentCategory.findFirst({
      where: { key: categoryKey },
      include: {
        image: true,
        child: { include: { image: true } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return localizeCategory(item, locale);
  }

  async findOneCategoryBySlug(categorySlug: string, locale: ContentLocale = 'fa'): Promise<ContentCategory> {
    const item = await this.db.contentCategory.findFirst({
      where: { slug: categorySlug },
      include: {
        image: true,
        child: { include: { image: true } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return localizeCategory(item, locale);
  }
}
