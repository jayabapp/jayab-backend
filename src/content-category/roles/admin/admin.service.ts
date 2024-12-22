import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Attachment, ContentCategory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateContentCategoryAdminDto } from './dto/create.dto';
import { UpdateContentCategoryAdminDto, UpdateContentCategoryDynamicFieldsAdminDto } from './dto/update.dto';
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
import { JsonArray } from '@prisma/client/runtime/library';
import { slugify } from 'src/common/helpers/slugify';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/content-category/common/helpers/model-props-builder.helper';

enum RefEnum {
  parent = 'parent',
  image = 'image',
}

type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.ContentCategoryScalarFieldEnum;

type ModifiedFilterProps = FilterProps & { key: ModelFields };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

@Injectable()
export class ContentCategoryAdminService {
  constructor(private readonly db: PrismaService) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateContentCategoryAdminDto): Promise<ContentCategory> {
    const stdKey = dto.key?.trim()?.replace(/ /g, '');
    const slug = slugify(dto.title);
    const isDuplicated = await this.db.contentCategory.findFirst({
      where: { OR: [{ key: stdKey }, { slug: slug }] },
    });
    if (isDuplicated) throw new BadRequestException('CONTENT1');

    const data: Prisma.ContentCategoryCreateInput = {
      ...dto,
      key: dto.key?.replace(/ /g, ''),
      slug: slug,
    };
    const newContentCategory = await this.db.contentCategory.create({ data: data });
    return newContentCategory;
  }

  /**
   * find all ContentCategory
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.ContentCategoryWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<ContentCategory>> {
    const list = paginate()<ContentCategory, Prisma.ContentCategoryFindManyArgs>(
      this.db.contentCategory,
      { where: filters, include: { parent: true, image: true } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find many
   * this method used for selectable lists with less than 50 items
   * @returns
   */
  async findMany(): Promise<ContentCategory[]> {
    const list = await this.db.contentCategory.findMany();
    return list;
  }

  /**
   * find one base
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.contentCategory.findUnique({
      where: { id },
      include: { parent: true, image: true },
    });
    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder();

    return { showProps, actions };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<ContentCategory> {
    const item = await this.db.contentCategory.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param id
   * @param dto
   * @returns
   */
  async update(id: number, dto: UpdateContentCategoryAdminDto): Promise<ContentCategory> {
    const stdKey = dto.key?.trim()?.replace(/ /g, '');
    const slug = slugify(dto.title);

    const isDuplicated = await this.db.contentCategory.findFirst({
      where: { OR: [{ key: stdKey }, { slug: slug }], id: { not: id } },
    });
    if (isDuplicated) throw new BadRequestException('CONTENT1');

    const item = await this.db.contentCategory.update({
      where: { id },
      data: { ...dto, slug: slugify(dto.title) },
    });

    return item;
  }

  /**
   * update Dynamic Fields
   * @param id
   * @param dto
   * @returns
   */
  async updateDynamicFields(
    id: number,
    dto: UpdateContentCategoryDynamicFieldsAdminDto,
    item: ContentCategory,
  ): Promise<ContentCategory> {
    const fields = (item.dynamic_fields || []) as JsonArray;
    // {key:string;title:string;type:string};
    const index = fields.findIndex((e: any) => e.key == dto.key);
    const newObj = { title: dto.title, key: dto.key, type: dto.type };
    let data = [];

    if (index > -1) {
      fields[index] = newObj;
      data = fields;
    } else data = fields.concat(newObj);

    const updatedItem = await this.db.contentCategory.update({
      where: { id },
      data: { dynamic_fields: data },
    });

    return updatedItem;
  }

  /**
   * delete Dynamic Fields
   * @param id
   * @param key
   * @param dto
   * @returns
   */
  async removeDynamicFields(id: number, key: string, item: ContentCategory): Promise<ContentCategory> {
    const fields = (item.dynamic_fields || []) as JsonArray;
    const data = fields.filter((e: any) => e.key != key);
    const updatedItem = await this.db.contentCategory.update({
      where: { id },
      data: { dynamic_fields: data },
    });

    return updatedItem;
  }

  /**
   * remove
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.db.contentCategory.delete({ where: { id } });
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

    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder(formattedCategories);

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }

  allActions(rbac: AccessControlList): Array<AvailableAction> {
    const allActions: Array<AvailableAction> = ['create', 'show', 'edit', 'delete'];
    const availableActions: Array<AvailableAction> = [];
    for (const act of allActions) {
      if (act == 'create' && rbac.c) availableActions.push('create');
      if (act == 'show' && rbac.r) availableActions.push('show');
      if (act == 'edit' && rbac.u) availableActions.push('edit');
      if (act == 'delete' && rbac.d) availableActions.push('delete');
    }

    return availableActions;
  }
}
