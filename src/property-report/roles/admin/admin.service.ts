import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Prisma, PropertyReport, User } from '@prisma/client';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/property-report/common/helpers/model-props-builder.helper';
import { CreatePropertyReportAdminDto } from './dto/create.dto';
import { UpdatePartialPropertyReportAdminDto } from './dto/update-partial.dto';
import { UpdatePropertyReportAdminDto } from './dto/update.dto';

@Injectable()
export class PropertyReportAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePropertyReportAdminDto): Promise<PropertyReport> {
    const newPropertyReport = await this.db.propertyReport.create({ data: dto });
    return newPropertyReport;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PropertyReport
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PropertyReportWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PropertyReport>> {
    const list = await paginate()<PropertyReport & { user: User }, Prisma.PropertyReportFindManyArgs>(
      this.db.propertyReport,
      { where: filters, include: { user: true } },
      { page, perPage },
    );

    list.data = list.data.map((item) => {
      return {
        ...item,
        user: { ...item.user, full_name: item.user?.full_name },
      };
    });

    return list;
  }

  /**
   * find one propertyReport
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.propertyReport.findUnique({ where: { id } });
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
  async findById(id: number): Promise<PropertyReport> {
    const item = await this.db.propertyReport.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdatePropertyReportAdminDto): Promise<PropertyReport> {
    const item = await this.db.propertyReport.update({
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
  async updatePartial(id: number, dto: UpdatePartialPropertyReportAdminDto): Promise<PropertyReport> {
    const item = await this.db.propertyReport.update({ where: { id }, data: dto });

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
    await this.db.propertyReport.delete({ where: { id } });
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
