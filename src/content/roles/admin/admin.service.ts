import { AccessControlList, Content, ContentCategory, Prisma } from '@prisma/client';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { CreateContentAdminDto } from './dto/create.dto';
import { UpdateContentAdminDto } from './dto/update.dto';
import { ContentTranslationsDto } from './dto/content-translations.dto';
import { isEmpty, omit } from 'lodash';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { hasTermsBody } from '../../common/helpers/content-translations.helper';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/content/common/helpers/model-props-builder.helper';

import type { ContentSort } from './dto/find-all.dto';

@Injectable()
export class ContentAdminService {
  constructor(private readonly db: PrismaService) {}

  async create(dto: CreateContentAdminDto): Promise<Content> {
    const stdKey = dto.key?.trim()?.replace(/ /g, '');
    this.validateTermsTranslations(stdKey, dto.translations);
    const isDuplicated = await this.db.content.findFirst({
      where: { OR: [{ key: stdKey }, { slug: dto.slug }] },
    });
    if (isDuplicated && stdKey && isDuplicated?.key === stdKey) throw new BadRequestException('CONTENT1');
    if (isDuplicated && isDuplicated?.slug === dto.slug) throw new BadRequestException('CONTENT2');
    if (!isEmpty(dto.attachments)) {
      const count = await this.db.attachment.count({ where: { id: { in: dto.attachments } } });
      if (count != dto.attachments?.length) throw new BadRequestException('ATTACH3');
    }

    const newContent = await this.db.content.create({
      data: {
        ...omit(dto, ['attachments', 'translations']),
        ...(dto.translations != null
          ? { translations: JSON.parse(JSON.stringify(dto.translations)) as Prisma.InputJsonObject }
          : {}),
      },
    });

    if (!isEmpty(dto.attachments)) {
      const attachs = [];
      dto.attachments.map((e) => attachs.push({ content_id: newContent.id, attachment_id: e }));
      await this.db.contentAttachment.createMany({ data: attachs });
    }
    return newContent;
  }

  async findAll(
    filters: Prisma.ContentWhereInput,
    page: number,
    perPage = 50,
    sortBy: ContentSort = 'date_desc',
  ): Promise<PaginatedResult<Content>> {
    let orderBy: Prisma.ContentOrderByWithRelationInput[] = [{ created_at: 'desc' }, { id: 'desc' }];
    if (sortBy === 'date_asc') orderBy = [{ created_at: 'asc' }, { id: 'asc' }];
    if (sortBy === 'view_desc') orderBy = [{ view_count: 'desc' }, { id: 'desc' }];
    if (sortBy === 'view_asc') orderBy = [{ view_count: 'asc' }, { id: 'asc' }];
    const list = await paginate()<
      Content & { category: ContentCategory & { parent: ContentCategory } },
      Prisma.ContentFindManyArgs
    >(
      this.db.content,
      {
        where: filters,
        include: { category: { include: { parent: true } }, feature_image: true, video: true },
        orderBy,
      },
      { page, perPage },
    );

    const formattedList = list.data.map((e) => {
      if (e.category?.parent_id) return { ...e, parent_category: e.category.parent };
      else return e;
    });
    return { data: formattedList, meta: list.meta };
  }

  async findMany(): Promise<Content[]> {
    const list = await this.db.content.findMany();
    return list;
  }

  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.content.findFirst({
      where: { id },
      include: {
        category: true,
        feature_image: true,
        video: true,
        attachments: { include: { attachment: true } },
      },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return { showProps, actions };
  }

  async findById(id: number): Promise<Content> {
    const item = await this.db.content.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

  async update(id: number, dto: UpdateContentAdminDto): Promise<Content> {
    const stdKey = dto.key?.trim()?.replace(/ /g, '');
    if (dto.translations != null) {
      const key =
        dto.key ?? (await this.db.content.findUnique({ where: { id }, select: { key: true } }))?.key;
      this.validateTermsTranslations(key, dto.translations);
    }

    const isDuplicated = await this.db.content.findFirst({
      where: { OR: [{ key: stdKey }, { slug: dto.slug }], id: { not: id } },
    });
    if (isDuplicated && stdKey && isDuplicated?.key === stdKey) throw new BadRequestException('CONTENT1');
    if (isDuplicated && isDuplicated?.slug === dto.slug) throw new BadRequestException('CONTENT2');

    if (!isEmpty(dto.attachments)) {
      const count = await this.db.attachment.count({ where: { id: { in: dto.attachments } } });
      if (count != dto.attachments?.length) throw new BadRequestException('ATTACH3');
    }

    const updatedContent = await this.db.content.update({
      where: { id },
      data: {
        ...omit(dto, ['attachments', 'translations']),
        ...(dto.translations != null
          ? { translations: JSON.parse(JSON.stringify(dto.translations)) as Prisma.InputJsonObject }
          : {}),
      },
    });

    await this.db.contentAttachment.deleteMany({ where: { content_id: id } });

    /**create attachments */
    if (!isEmpty(dto.attachments)) {
      const attachs = [];
      dto.attachments.map((e) => attachs.push({ content_id: id, attachment_id: e }));
      await this.db.contentAttachment.createMany({ data: attachs });
    }

    return updatedContent;
  }

  async remove(id: number): Promise<void> {
    await this.db.content.delete({ where: { id } });
    await this.db.contentAttachment.deleteMany({ where: { content_id: id } });
  }

  private validateTermsTranslations(
    key: string | null | undefined,
    translations?: ContentTranslationsDto,
  ): void {
    if (key !== 'terms' || !translations) return;
    for (const locale of ['ar', 'en'] as const) {
      if (translations[locale] && !hasTermsBody(translations[locale].html)) {
        throw new BadRequestException('CONTENT_TERMS_BODY_REQUIRED');
      }
    }
  }

  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    const categories = await this.db.contentCategory.findMany({ include: { parent: true } });
    const formattedCategories = categories.map((e) => {
      if (e.parent) return { ...e, title: `${e.title} ⬅ ${e.parent.title}` };
      else return e;
    });

    const keys = (await this.db.contentCategory.findMany({ include: { parent: true } })).map((e) => ({
      id: e.id,
      title: e.parent ? `${e.title} ⬅ ${e.parent.title}` : e.title,
    }));
    const availableActions = allActionsBuilder(rbac);
    const filterProps = filterPropsBuilder(keys);
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder(formattedCategories);

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
