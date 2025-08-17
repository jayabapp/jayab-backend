import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  AccessControlList,
  Attachment,
  Content,
  ContentAttachment,
  ContentCategory,
  Prisma,
} from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentAdminDto } from './dto/create.dto';
import { UpdateContentAdminDto, UpdateContentProductCategoryAdminDto } from './dto/update.dto';
import {
  AvailableAction,
  Column,
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { isEmpty, omit } from 'lodash';
import { slugify } from 'src/common/helpers/slugify';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/content/common/helpers/model-props-builder.helper';

@Injectable()
export class ContentAdminService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateContentAdminDto): Promise<Content> {
    const stdKey = dto.key?.trim()?.replace(/ /g, '');

    const isDuplicated = await this.db.content.findFirst({
      where: { OR: [{ key: stdKey }, { slug: dto.slug }] },
    });
    if (isDuplicated && stdKey && isDuplicated?.key === stdKey) throw new BadRequestException('CONTENT1');
    if (isDuplicated && isDuplicated?.slug === dto.slug) throw new BadRequestException('CONTENT2');

    /**check attach */
    if (!isEmpty(dto.attachments)) {
      const count = await this.db.attachment.count({ where: { id: { in: dto.attachments } } });
      if (count != dto.attachments?.length) throw new BadRequestException('ATTACH3');
    }

    const newContent = await this.db.content.create({
      data: { ...omit(dto, 'attachments') },
    });

    /**create attachments */
    if (!isEmpty(dto.attachments)) {
      const attachs = [];
      dto.attachments.map((e) => attachs.push({ content_id: newContent.id, attachment_id: e }));
      await this.db.contentAttachment.createMany({ data: attachs });
    }

    return newContent;
  }

  /**
   * find all Content
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.ContentWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<Content>> {
    const list = await paginate()<
      Content & { category: ContentCategory & { parent: ContentCategory } },
      Prisma.ContentFindManyArgs
    >(
      this.db.content,
      {
        where: filters,
        include: { category: { include: { parent: true } }, feature_image: true, video: true },
        orderBy: { id: 'desc' },
      },
      { page, perPage },
    );

    const formattedList = list.data.map((e) => {
      if (e.category?.parent_id) return { ...e, parent_category: e.category.parent };
      else return e;
    });
    return { data: formattedList, meta: list.meta };
  }

  /**
   * find many
   * this method used for selectable lists with less than 50 items
   * @returns
   */
  async findMany(): Promise<Content[]> {
    const list = await this.db.content.findMany();
    return list;
  }

  /**
   * find one by id
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
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

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<Content> {
    const item = await this.db.content.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param id
   * @param dto
   * @returns
   */
  async update(id: number, dto: UpdateContentAdminDto): Promise<Content> {
    const stdKey = dto.key?.trim()?.replace(/ /g, '');

    const isDuplicated = await this.db.content.findFirst({
      where: { OR: [{ key: stdKey }, { slug: dto.slug }], id: { not: id } },
    });
    if (isDuplicated && stdKey && isDuplicated?.key === stdKey) throw new BadRequestException('CONTENT1');
    if (isDuplicated && isDuplicated?.slug === dto.slug) throw new BadRequestException('CONTENT2');

    /**check attach */
    if (!isEmpty(dto.attachments)) {
      const count = await this.db.attachment.count({ where: { id: { in: dto.attachments } } });

      if (count != dto.attachments?.length) throw new BadRequestException('ATTACH3');
    }

    const updatedContent = await this.db.content.update({
      where: { id },
      data: { ...omit(dto, 'attachments') },
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

  /**
   * remove
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.db.content.delete({ where: { id } });
    await this.db.contentAttachment.deleteMany({ where: { content_id: id } });
  }

  /* -------------------------------------------------------------------------- */
  /*                                   HELPER                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find model props
   * @param rbac
   * @returns
   */
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

    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder(keys);
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder(formattedCategories);

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
