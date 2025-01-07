import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, PropertyBadge, Prisma, Property, User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyBadgeAdminDto } from './dto/create.dto';
import { UpdatePropertyBadgeAdminDto } from './dto/update.dto';
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
} from 'src/property-badge/common/helpers/model-props-builder.helper';
import { UpdatePartialPropertyBadgeAdminDto } from './dto/update-partial.dto';
import { AdminType } from 'src/common/interfaces/user.interface';
import { AdminDescription } from 'src/common/interfaces/admin-description.type';
import {
  PropertyBadgeStatus,
  PropertyBadgeStatusList,
} from 'src/property-badge/common/property-badge-status.type';

@Injectable()
export class PropertyBadgeAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PropertyBadge
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PropertyBadgeWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PropertyBadge>> {
    const list = await paginate()<PropertyBadge, Prisma.PropertyBadgeFindManyArgs>(
      this.db.propertyBadge,
      { where: filters, include: { property: true } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one propertyBadge
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.propertyBadge.findUnique({ where: { id }, include: { property: true } });
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
  async findById(
    id: number,
  ): Promise<PropertyBadge & { property: Partial<Property> & { owner: { user: Partial<User> } } }> {
    const item = await this.db.propertyBadge.findUnique({
      where: { id },
      include: {
        property: {
          select: { id: true, title: true, owner: { select: { user: { select: { id: true } } } } },
        },
      },
    });
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
  async update(id: number, dto: UpdatePropertyBadgeAdminDto): Promise<PropertyBadge> {
    const item = await this.db.propertyBadge.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  async updateStatus(
    id: number,
    admin: AdminType,
    dto: UpdatePartialPropertyBadgeAdminDto,
  ): Promise<PropertyBadge> {
    const adminDscr: AdminDescription = {
      description: dto.admin_description || '',
      status: PropertyBadgeStatusList.find((e) => e.id === dto.status)?.title,
      admin_name: admin.full_name,
      admin_id: admin.id,
      admin_role: admin.role.name,
      created_at: new Date(),
    };

    let item: PropertyBadge;

    //update is_authorize in property for flat DB design
    await this.db.$transaction(async (tx) => {
      item = await tx.propertyBadge.update({
        where: { id },
        data: { status: dto.status, changelog: { push: adminDscr } },
      });

      await tx.property.update({
        where: { id: item.property_id },
        data: { has_blue_tick: dto.status === PropertyBadgeStatus.APPROVED ? true : false },
      });
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
  async remove(id: number, propertyId: number): Promise<void> {
    await this.db.propertyBadge.delete({ where: { id } });
    await this.db.property.update({ where: { id: propertyId }, data: { has_blue_tick: false } });
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
