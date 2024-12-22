import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { AccessControlList, Attachment, Banner, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateBannerAdminDto } from './dto/create.dto';
import { UpdateBannerAdminDto } from './dto/update.dto';
import {
  AvailableAction,
  Column,
  CreateProps,
  FilterProps,
  OperatorItems,
  ShowAction,
  ShowProps,
  TableProps,
} from 'src/common/interfaces/model-props.interface';
import { operators, operatorsList } from 'src/common/utils/constants/filter-operators.constant';
import { PaginatedResult, paginate } from 'src/common/helpers/paginator';
import { BannerPositionList } from 'src/banner/common/banner-positions.constant';
import { AttachmentAdminFolder } from 'src/attachment/interfaces/attachment-folder.enum';
import {
  allActionsBuilder,
  createPropsBuilder,
  filterPropsBuilder,
  showActionBuilder,
  showPropsBuilder,
  tablePropsBuilder,
} from 'src/banner/common/helpers/model-props-builder.helper';
import { CategoryAdminService } from 'src/category/roles/admin/category-admin.service';

enum RefEnum {
  image = 'image',
}

type ModelFields = keyof typeof RefEnum | keyof typeof Prisma.BannerScalarFieldEnum;

type ModifiedFilterProps = FilterProps & { key: ModelFields };
type ModifiedColumn = Column & { key: ModelFields };
type ModifiedTableProps = TableProps & { columns: ModifiedColumn[] };

@Injectable()
export class BannerAdminService {
  constructor(
    private readonly db: PrismaService,
    private readonly categoryAdminService: CategoryAdminService,
  ) {}

  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateBannerAdminDto): Promise<Banner> {
    const newBanner = await this.db.banner.create({ data: dto });
    return newBanner;
  }

  /**
   * find all Banner
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(filters: object, page: number, perPage = 50): Promise<PaginatedResult<Banner>> {
    const list = await paginate()<Banner, Prisma.BannerFindManyArgs>(
      this.db.banner,
      { where: filters, include: { image: true, image_sm: true } },
      { page, perPage },
    );

    return list;
  }

  /**
   * find many
   * this method used for selectable lists with less than 50 items
   * @returns
   */
  async findMany(): Promise<Banner[]> {
    const list = await this.db.banner.findMany();
    return list;
  }

  /**
   * find one banner
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.banner.findUnique({
      where: { id },
      include: { category: true, image: true, image_sm: true },
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
  async findById(id: number): Promise<Banner> {
    const item = await this.db.banner.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('NOT_FOUND');

    return item;
  }

  /**
   * update
   * @param id
   * @param dto
   * @returns
   */
  async update(id: number, dto: UpdateBannerAdminDto): Promise<Banner> {
    if (dto.category_id) dto.product_id = null;
    else if (dto.product_id) dto.category_id = null;
    else {
      dto.category_id = null;
      dto.product_id = null;
    }
    const item = await this.db.banner.update({
      where: { id },
      data: dto,
    });

    return item;
  }

  /**
   * remove
   * @param id
   */
  async remove(id: number): Promise<void> {
    await this.db.banner.delete({ where: { id } });
  }

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
    // const categories = await this.categoryAdminService.findAll();
    // const products = await this.db.product.findMany({
    //   where: { is_active: true },
    //   select: { id: true, title: true },
    // });
    // ACTIONS
    const availableActions = allActionsBuilder(rbac);

    // PROPS
    const filterProps = filterPropsBuilder();
    const tableProps = tablePropsBuilder(availableActions);
    const createProps = createPropsBuilder();

    return { operators: operatorsList, filterProps, createProps, tableProps };
  }
}
