import { Injectable, NotFoundException } from '@nestjs/common';
import { Attachment, Content, ContentCategory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { ContentSort, FindAllContentSharedDto } from './dto/find-all.dto';

@Injectable()
export class ContentSharedService {
  constructor(private readonly db: PrismaService) {}

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

    /**
     * query
     */
    let where: Prisma.ContentWhereInput = {
      is_active: true,
      category: { OR: [{ id: category.id }, { parent_id: category.id }] },
    };
    if (dto.q && typeof dto.q === 'string') {
      const titles = dto.q.split(' ');
      const titleQuery = [];
      titles.map((e) => {
        titleQuery.push({ title: { contains: e, mode: 'insensitive' } });
      });

      where = { ...where, OR: titleQuery };
    }

    const query: Prisma.ContentFindManyArgs = {
      where: where,
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
      where: { id: contentId },
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
      where: { key: `${key}` },
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
    const item = await this.db.content.update({
      where: { slug },
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
      data: { view_count: { increment: 1 } },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

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
