import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, PeakDay, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePeakDayAdminDto } from './dto/create.dto';
import { UpdatePeakDayAdminDto } from './dto/update.dto';
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
} from 'src/peak-day/common/helpers/model-props-builder.helper';
import { UpdatePartialPeakDayAdminDto } from './dto/update-partial.dto';
import { convertJalaaliDtoToDate } from 'src/common/helpers/date.helper';
import moment from 'moment-jalaali';

@Injectable()
export class PeakDayAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreatePeakDayAdminDto): Promise<PeakDay> {
    const date = convertJalaaliDtoToDate(dto);
    const timestamp = +moment(date).unix();

    const peakDay = await this.db.peakDay.findFirst({ where: { date } });

    if (peakDay) throw new ConflictException('PEAK_DAY1');

    const newPeakDay = await this.db.peakDay.create({ data: { ...dto, timestamp, date } });

    return newPeakDay;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PeakDay
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PeakDayWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PeakDay>> {
    const list = await paginate()<PeakDay, Prisma.PeakDayFindManyArgs>(
      this.db.peakDay,
      { where: filters, orderBy: { date: 'asc' } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one peakDay
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.peakDay.findUnique({ where: { id } });
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
  async findById(id: number): Promise<PeakDay> {
    const item = await this.db.peakDay.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdatePeakDayAdminDto): Promise<PeakDay> {
    const item = await this.db.peakDay.update({
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
  async updatePartial(id: number, dto: UpdatePartialPeakDayAdminDto): Promise<PeakDay> {
    const item = await this.db.peakDay.update({
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
    await this.db.peakDay.delete({ where: { id } });
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
