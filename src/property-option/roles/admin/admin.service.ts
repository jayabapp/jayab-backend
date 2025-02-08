import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, PropertyOption, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyOptionAdminDto } from './dto/create.dto';
import { UpdatePropertyOptionAdminDto } from './dto/update.dto';
import {
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/property-option/common/helpers/model-props-builder.helper';
import { UpdatePartialPropertyOptionAdminDto } from './dto/update-partial.dto';

@Injectable()
export class PropertyOptionAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyOptionAdminDto): Promise<PropertyOption> {
    if (dto.key) {
      const isDuplicatedKey = await this.db.propertyOption.findFirst({ where: { key: dto.key } });
      if (isDuplicatedKey) throw new NotFoundException('PROP_OPTION1');

      const isDuplicatedCity = await this.db.city.findFirst({ where: { slug: dto.key } });
      if (isDuplicatedCity) throw new NotFoundException('PROP_OPTION2');
    }

    const newPropertyOption = await this.db.propertyOption.create({ data: dto });
    return newPropertyOption;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PropertyOption
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PropertyOptionWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PropertyOption>> {
    const list = await paginate()<PropertyOption, Prisma.PropertyOptionFindManyArgs>(
      this.db.propertyOption,
      { where: filters, include: { image: true }, orderBy: { sort: { sort: 'asc', nulls: 'last' } } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one propertyOption
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.propertyOption.findUnique({ where: { id }, include: { image: true } });
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
  async findById(id: number): Promise<PropertyOption> {
    const item = await this.db.propertyOption.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdatePropertyOptionAdminDto): Promise<PropertyOption> {
    if (dto.key) {
      const isDuplicatedKey = await this.db.propertyOption.findFirst({
        where: { key: dto.key, id: { not: id } },
      });
      if (isDuplicatedKey) throw new NotFoundException('PROP_OPTION1');

      const isDuplicatedCity = await this.db.city.findFirst({ where: { slug: dto.key } });
      if (isDuplicatedCity) throw new NotFoundException('PROP_OPTION2');
    }

    const item = await this.db.propertyOption.update({
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
  async updatePartial(id: number, dto: UpdatePartialPropertyOptionAdminDto): Promise<PropertyOption> {
    const item = await this.db.propertyOption.update({
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
    await this.db.propertyOption.delete({ where: { id } });
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
