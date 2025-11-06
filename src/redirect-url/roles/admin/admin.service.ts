import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { AccessControlList, RedirectUrl, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateRedirectUrlAdminDto } from './dto/create.dto';
import { UpdateRedirectUrlAdminDto } from './dto/update.dto';
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
} from 'src/redirect-url/common/helpers/model-props-builder.helper';
import { UpdatePartialRedirectUrlAdminDto } from './dto/update-partial.dto';
import crypto from 'crypto';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { REDIRECT_URL_CACHE_KEY } from 'src/redirect-url/common/helpers/cache-key.constant';

@Injectable()
export class RedirectUrlAdminService {
  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly db: PrismaService,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                   CREATE                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * create
   * @param dto
   * @returns
   */
  async create(dto: CreateRedirectUrlAdminDto): Promise<RedirectUrl> {
    //create hash
    const cipher = crypto.createHash('md5');
    cipher.update(dto.source);
    const hash = cipher.digest('hex');

    //check duplication
    const isDuplicated = await this.db.redirectUrl.findFirst({ where: { source_hash: hash } });
    if (isDuplicated) throw new UnprocessableEntityException('REDIRECT_URL1');

    const newRedirectUrl = await this.db.redirectUrl.create({
      data: {
        source: dto.source,
        destination: dto.destination,
        source_hash: hash,
        permanent: dto.permanent,
      },
    });
    return newRedirectUrl;
  }

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all RedirectUrl
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.RedirectUrlWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<RedirectUrl>> {
    const list = await paginate()<RedirectUrl, Prisma.RedirectUrlFindManyArgs>(
      this.db.redirectUrl,
      { where: filters },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one redirectUrl
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.redirectUrl.findUnique({ where: { id } });
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
  async findById(id: number): Promise<RedirectUrl> {
    const item = await this.db.redirectUrl.findUnique({ where: { id } });
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
  async update(beforeUpdate: RedirectUrl, dto: UpdateRedirectUrlAdminDto): Promise<RedirectUrl> {
    //create hash
    const cipher = crypto.createHash('md5');
    cipher.update(dto.source);
    const hash = cipher.digest('hex');

    //check duplication
    const isDuplicated = await this.db.redirectUrl.findFirst({
      where: { source_hash: hash, id: { not: beforeUpdate.id } },
    });
    if (isDuplicated) throw new UnprocessableEntityException('REDIRECT_URL1');

    //update
    const item = await this.db.redirectUrl.update({
      where: { id: beforeUpdate.id },
      data: {
        source: dto.source,
        destination: dto.destination,
        source_hash: hash,
        permanent: dto.permanent,
      },
    });

    //delete cache (user controller interceptor)
    await this.cacheManager.del(REDIRECT_URL_CACHE_KEY(hash));

    return item;
  }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialRedirectUrlAdminDto): Promise<RedirectUrl> {
    const item = await this.db.redirectUrl.update({
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
    await this.db.redirectUrl.delete({ where: { id } });
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
