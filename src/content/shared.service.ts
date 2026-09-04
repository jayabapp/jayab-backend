import { Attachment, Content, ContentCategory, Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { FindAllContentSharedDto } from './dto/find-all.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ContentSharedService {
  constructor(private readonly db: PrismaService) {}

  private publishedContentWhere(): Prisma.ContentWhereInput {
    return {
      is_active: true,
      OR: [{ published_at: null }, { published_at: { lte: new Date() } }],
    };
  }

  /**
   * find all Content
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    dto: FindAllContentSharedDto,
  ): Promise<PaginatedResult<Content> & { subcategories: Array<ContentCategory & { image: Attachment }> }> {
    const { page, per_page: perPage, key } = dto;
    /**
     * check category
     */
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
            feature_image: true,
            view_count: true,
            created_at: true,
            category: { select: { id: true, title: true, slug: true } },
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

    return { data: list.data, meta: list.meta, subcategories: category.child || [] };
  }

  /**
   * find one content
   * @param contentId
   * @returns
   */
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

  /**
   * find one by key
   * @param key
   * @returns
   */
  async findOneByKey(key: string): Promise<Content> {
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

    return item;
  }

  /**
   * find one content by slug
   * @param contentId
   * @returns
   */
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

  /**
   * find the category by key
   * @param categoryKey
   * @returns
   */
  async findOneCategory(categoryKey: string): Promise<ContentCategory> {
    const item = await this.db.contentCategory.findFirst({
      where: { key: categoryKey },
      include: {
        image: true,
        child: { include: { image: true } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * find the category by slug
   * @param categorySlug
   * @returns
   */
  async findOneCategoryBySlug(categorySlug: string): Promise<ContentCategory> {
    const item = await this.db.contentCategory.findFirst({
      where: { slug: categorySlug },
      include: {
        image: true,
        child: { include: { image: true } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }
}
