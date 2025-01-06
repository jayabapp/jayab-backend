import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, PropertyAuthorize, Prisma, User, Property, Admin } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyAuthorizeAdminDto } from './dto/create.dto';
import { UpdatePropertyAuthorizeAdminDto } from './dto/update.dto';
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
} from 'src/property-authorize/common/helpers/model-props-builder.helper';
import { UpdatePartialPropertyAuthorizeAdminDto } from './dto/update-partial.dto';
import { AdminDescription } from 'src/common/interfaces/admin-description.type';
import {
  PropertyAuthorizeStatuses,
  PropertyAuthorizeStatusesList,
} from 'src/property-authorize/common/property-authorize-status.type';
import { AdminType } from 'src/common/interfaces/user.interface';

@Injectable()
export class PropertyAuthorizeAdminService {
  constructor(private readonly db: PrismaService) {}
  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PropertyAuthorize
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PropertyAuthorizeWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PropertyAuthorize>> {
    const list = await paginate()<PropertyAuthorize, Prisma.PropertyAuthorizeFindManyArgs>(
      this.db.propertyAuthorize,
      { where: filters, include: { property: { select: { id: true, title: true } } } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one PropertyAuthorize
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.propertyAuthorize.findUnique({
      where: { id },
      include: { property: true, nc_image: true, docs: true },
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
  async findById(id: number): Promise<
    PropertyAuthorize & {
      property: Partial<Property> & { owner: { user: Partial<User> } };
    }
  > {
    const item = await this.db.propertyAuthorize.findUnique({
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
  async update(id: number, dto: UpdatePropertyAuthorizeAdminDto): Promise<PropertyAuthorize> {
    const item = await this.db.propertyAuthorize.update({
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
  async updateStatus(
    id: number,
    admin: AdminType,
    dto: UpdatePartialPropertyAuthorizeAdminDto,
  ): Promise<PropertyAuthorize> {
    const adminDscr: AdminDescription = {
      description: dto.admin_description || '',
      status: PropertyAuthorizeStatusesList.find((e) => e.id === dto.status)?.title,
      admin_name: admin.full_name,
      admin_id: admin.id,
      admin_role: admin.role.name,
      created_at: new Date(),
    };

    let item: PropertyAuthorize;

    //update is_authorize in property for flat DB design
    await this.db.$transaction(async (tx) => {
      item = await tx.propertyAuthorize.update({
        where: { id },
        data: { status: dto.status, changelog: { push: adminDscr } },
      });

      await tx.property.update({
        where: { id: item.property_id },
        data: { is_authorized: dto.status === PropertyAuthorizeStatuses.APPROVED ? true : false },
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
  async remove(id: number): Promise<void> {
    await this.db.propertyAuthorize.delete({ where: { id } });
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
