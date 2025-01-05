import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, PropertyAuthorized, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyAuthorizedAdminDto } from './dto/create.dto';
import { UpdatePropertyAuthorizedAdminDto } from './dto/update.dto';
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
} from 'src/property-authorized/common/helpers/model-props-builder.helper';
import { UpdatePartialPropertyAuthorizedAdminDto } from './dto/update-partial.dto';

@Injectable()
export class PropertyAuthorizedAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyAuthorizedAdminDto): Promise<PropertyAuthorized> {
    const newPropertyAuthorized = await this.db.propertyAuthorized.create({ data: dto });
    return newPropertyAuthorized;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PropertyAuthorized
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(filters: Prisma.PropertyAuthorizedWhereInput, page: number, perPage = 50): Promise<PaginatedResult<PropertyAuthorized>> {
    const list = await paginate()<PropertyAuthorized, Prisma.PropertyAuthorizedFindManyArgs>(
      this.db.propertyAuthorized,
      { where: filters },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one propertyAuthorized
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.propertyAuthorized.findUnique({ where: { id } });
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
  async findById(id: number): Promise<PropertyAuthorized> {
    const item = await this.db.propertyAuthorized.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdatePropertyAuthorizedAdminDto): Promise<PropertyAuthorized> {
    const item = await this.db.propertyAuthorized.update({
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
  async updatePartial(id: number, dto: UpdatePartialPropertyAuthorizedAdminDto): Promise<PropertyAuthorized> {
    const item = await this.db.propertyAuthorized.update({
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
    await this.db.propertyAuthorized.delete({ where: { id } });
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
