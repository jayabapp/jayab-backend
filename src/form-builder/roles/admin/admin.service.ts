import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, FormBuilder, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateFormBuilderAdminDto } from './dto/create.dto';
import { UpdateFormBuilderAdminDto } from './dto/update.dto';
import {
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/form-builder/common/helpers/model-props-builder.helper';
import { UpdatePartialFormBuilderAdminDto } from './dto/update-partial.dto';
import { FindAllFormBuilderAdminDto } from './dto/find-all.dto';

@Injectable()
export class FormBuilderAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateFormBuilderAdminDto): Promise<FormBuilder> {
    const isDuplicated = await this.db.formBuilder.findFirst({
      where: { content_id: dto.content_id, title: dto.title },
    });
    if (isDuplicated) throw new BadRequestException('CATEGORY_OPTION1');

    const newFormBuilder = await this.db.formBuilder.create({ data: dto });
    return newFormBuilder;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all FormBuilder
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(dto: object, page: number, perPage = 50): Promise<PaginatedResult<FormBuilder>> {
    const list = await paginate()<FormBuilder, Prisma.FormBuilderFindManyArgs>(
      this.db.formBuilder,
      { where: dto, orderBy: { sort_order: { sort: 'asc', nulls: 'last' } } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one formBuilder
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.formBuilder.findUnique({ where: { id } });
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
  async findById(id: number): Promise<FormBuilder> {
    const item = await this.db.formBuilder.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * update
   * @param id
   * @param dto
   * @returns
   */
  async update(id: number, dto: UpdateFormBuilderAdminDto): Promise<FormBuilder> {
    const isDuplicated = await this.db.formBuilder.findFirst({
      where: { content_id: dto.content_id, title: dto.title, id: { not: id } },
    });
    if (isDuplicated) throw new BadRequestException('CATEGORY_OPTION1');

    const item = await this.db.formBuilder.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialFormBuilderAdminDto): Promise<FormBuilder> {
    const item = await this.db.formBuilder.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   DELETE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * remove
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.db.formBuilder.delete({ where: { id } });
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
    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
