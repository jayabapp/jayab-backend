import { Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Property, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePropertyAdminDto } from './dto/create.dto';
import { UpdatePropertyAdminDto } from './dto/update.dto';
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
} from 'src/property/common/helpers/model-props-builder.helper';
import { UpdatePartialPropertyAdminDto } from './dto/update-partial.dto';
import { startOfDate, startOfToday } from 'src/common/helpers/date.helper';
import moment from 'moment-jalaali';
import { DayHelper } from 'src/common/helpers/day.helper';
import {
  PropertyArrayResType,
  PropertyJsonType,
  PropertyResType,
  PropertySerializer,
} from 'src/property/serializer/property.serializer';
import { PropertyStatuses } from 'src/property/common/types/property-status.type';

@Injectable()
export class PropertyAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly dayHelper: DayHelper,
    private readonly propertySerializer: PropertySerializer,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all Property
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PropertyWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PropertyArrayResType>> {
    const calendarDateQuery: Prisma.PropertyCalendarWhereInput = {
      date: { gte: startOfToday(), lt: startOfDate(moment().add(8, 'days').toDate()) },
    };

    const list = await paginate()<PropertyJsonType, Prisma.PropertyFindManyArgs>(
      this.db.property,
      {
        where: filters,
        include: {
          feature_image: true,
          province: { select: { title: true } },
          city: { select: { title: true } },
          property_options: true,
          daily_price: true,
          calendar: { where: calendarDateQuery },
          bedrooms: { select: { total_bedrooms: true } },
          _count: { select: { attachments: true } },
          favorites: true,
        },
      },
      { page, perPage },
    );

    const today = await this.dayHelper.today();
    const serialized = await this.propertySerializer.toArray(list.data, today, false);

    return { data: serialized, meta: list.meta };
  }

  /**
   * find one property
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.property.findUnique({ where: { id } });
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
  async findById(id: number): Promise<Property> {
    const item = await this.db.property.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /* -------------------------------------------------------------------------- */
  /*                                   UPDATE                                   */
  /* -------------------------------------------------------------------------- */
  // /**
  //  * update
  //  * @param id
  //  * @param dto
  //  * @returns
  //  */
  // async update(id: number, dto: UpdatePropertyAdminDto): Promise<Property> {
  //   const item = await this.db.property.update({
  //     where: { id },
  //     data: dto,
  //   });

  //   return item;
  // }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialPropertyAdminDto): Promise<Property> {
    const item = await this.db.property.update({
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
    await this.db.property.delete({ where: { id } });
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
