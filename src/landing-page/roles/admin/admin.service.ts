import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AccessControlList, LandingPage, Prisma } from '@prisma/client';
import { UpdatePartialLandingPageAdminDto } from './dto/update-partial.dto';
import { CreateLandingPageAdminDto } from './dto/create.dto';
import { UpdateLandingPageAdminDto } from './dto/update.dto';
import { LandingPagePositionList } from 'src/landing-page/common/landing-position.enum';
import { withTitleTranslations } from 'src/common/helpers/title-translations.helper';
import { operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PrismaService } from 'src/prisma/prisma.service';

import {
  CreateProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { type PaginatedResult, paginate } from 'src/common/helpers/paginator';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/landing-page/common/helpers/model-props-builder.helper';

@Injectable()
export class LandingPageAdminService {
  constructor(private readonly db: PrismaService) {}

  async create(dto: CreateLandingPageAdminDto): Promise<LandingPage> {
    const newLandingPage = await this.db.landingPage.create({ data: withTitleTranslations(dto) });
    return newLandingPage;
  }

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

  async findById(id: number): Promise<LandingPage> {
    const item = await this.db.landingPage.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');
    return item;
  }

  async update(id: number, dto: UpdateLandingPageAdminDto): Promise<LandingPage> {
    const isUrlDuplicated = await this.db.landingPage.findFirst({ where: { url: dto.url, id: { not: id } } });
    if (isUrlDuplicated) throw new UnprocessableEntityException('LANDING_PAGE1');
    const item = await this.db.landingPage.update({
      where: { id },
      data: withTitleTranslations(dto),
    });
    return item;
  }

  async updatePartial(id: number, dto: UpdatePartialLandingPageAdminDto): Promise<LandingPage> {
    const item = await this.db.landingPage.update({
      where: { id },
      data: dto,
    });
    return item;
  }

  async remove(id: number): Promise<void> {
    await this.db.landingPage.delete({ where: { id } });
  }

  async findModelProps(rbac: AccessControlList): Promise<{
    filterProps: Array<CreateProps>;
    createProps: Array<CreateProps>;
    tableProps: TableProps;
    operators: Array<OperatorItems>;
  }> {
    const availableActions = allActionsBuilder(rbac);
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();
    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
