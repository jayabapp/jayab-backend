import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AccessControlList, LandingPage, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateLandingPageAdminDto } from './dto/create.dto';
import { UpdateLandingPageAdminDto } from './dto/update.dto';
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
} from 'src/landing-page/common/helpers/model-props-builder.helper';
import { UpdatePartialLandingPageAdminDto } from './dto/update-partial.dto';
import { LandingPagePositionList } from 'src/landing-page/common/landing-position.enum';

@Injectable()
export class LandingPageAdminService {
  constructor(private readonly db: PrismaService) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateLandingPageAdminDto): Promise<LandingPage> {
    const newLandingPage = await this.db.landingPage.create({ data: dto });
    return newLandingPage;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all LandingPage
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.LandingPageWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<LandingPage>> {
    const list = await paginate()<LandingPage, Prisma.LandingPageFindManyArgs>(
      this.db.landingPage,
      { where: filters, include: { image: true } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one landingPage
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[]; data: any }> {
    const item = await this.db.landingPage.findUnique({
      where: { id },
      include: { image: true, main_content: true },
    });
    const relatedLandings =
      item.related_landings?.length > 0
        ? await this.db.landingPage.findMany({ where: { id: { in: item.related_landings } } })
        : null;
    const cities =
      item.cities?.length > 0 ? await this.db.city.findMany({ where: { id: { in: item.cities } } }) : [];
    const province = item.province_id
      ? await this.db.city.findFirst({ where: { id: item.province_id } })
      : null;

    if (!item) throw new NotFoundException('NOT_FOUND');

    const showProps = showPropsBuilder(item);
    const actions = showActionBuilder(item);

    return {
      showProps,
      actions,
      data: {
        ...item,
        related_landings: relatedLandings,
        cities,
        province,
        position_list: LandingPagePositionList,
      },
    };
  }

  /**
   * find by id
   * @param id
   * @returns
   */
  async findById(id: number): Promise<LandingPage> {
    const item = await this.db.landingPage.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdateLandingPageAdminDto): Promise<LandingPage> {
    const isUrlDuplicated = await this.db.landingPage.findFirst({ where: { url: dto.url, id: { not: id } } });
    if (isUrlDuplicated) throw new UnprocessableEntityException('LANDING_PAGE1');

    const item = await this.db.landingPage.update({
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
  async updatePartial(id: number, dto: UpdatePartialLandingPageAdminDto): Promise<LandingPage> {
    const item = await this.db.landingPage.update({
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
    await this.db.landingPage.delete({ where: { id } });
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
