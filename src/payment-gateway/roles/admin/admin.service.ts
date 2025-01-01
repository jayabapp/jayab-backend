import { Inject, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { AccessControlList, PaymentGateway, Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdatePaymentGatewayAdminDto } from './dto/update.dto';
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
} from 'src/payment-gateway/common/helpers/model-props-builder.helper';
import { UpdatePartialPaymentGatewayAdminDto } from './dto/update-partial.dto';
import { PaymentGatewayEnum, PaymentGatewayParams } from 'src/payment-gateway/common/payment-gateway.enum';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class PaymentGatewayAdminService {
  constructor(
    private readonly db: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /* -------------------------------------------------------------------------- */
  /*                                    FETCH                                   */
  /* -------------------------------------------------------------------------- */
  /**
   * find all PaymentGateway
   * @param filers
   * @param page
   * @param perPage
   * @returns
   */
  async findAll(
    filters: Prisma.PaymentGatewayWhereInput,
    page: number,
    perPage = 50,
  ): Promise<PaginatedResult<PaymentGateway>> {
    const list = await paginate()<PaymentGateway, Prisma.PaymentGatewayFindManyArgs>(
      this.db.paymentGateway,
      { where: filters },
      { page, perPage },
    );

    return list;
  }

  /**
   * find one paymentGateway
   * this method is used in the findOne controller to include or select items
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<{ showProps: ShowProps[]; actions?: ShowAction[] }> {
    const item = await this.db.paymentGateway.findUnique({ where: { id } });
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
  async findById(id: number): Promise<PaymentGateway> {
    const item = await this.db.paymentGateway.findUnique({ where: { id } });
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
  async update(id: number, dto: UpdatePaymentGatewayAdminDto): Promise<PaymentGateway> {
    const gate = await this.db.paymentGateway.findFirst({
      where: { id },
    });
    if (!gate) throw new NotFoundException('NOT_FOUND');

    //validate params
    const gateParams = gate.params as PaymentGatewayParams[];
    const reg = new RegExp(/^[-\w\s]+$/);
    for (const param of dto.params) {
      if (gateParams.findIndex((e) => e.key === param.key) === -1)
        throw new UnprocessableEntityException('GATEWAY1');
      if (!param.value) throw new UnprocessableEntityException('GATEWAY2');
      if (!reg.test(param.value)) throw new UnprocessableEntityException('GATEWAY3');
    }

    //update
    const item = await this.db.paymentGateway.update({
      where: { id },
      data: dto,
    });

    /**
     * delete cache
     */
    await this.cacheManager.del(`gateway:${gate.key}`);

    return item;
  }

  /**
   * Update editable columns in admin panel table
   * @param id
   * @param dto
   * @returns
   */
  async updatePartial(id: number, dto: UpdatePartialPaymentGatewayAdminDto): Promise<PaymentGateway> {
    const gate = await this.db.paymentGateway.findFirst({
      where: { id },
    });
    if (!gate) throw new NotFoundException('NOT_FOUND');

    if (dto.is_active) {
      const gateParams = gate.params as PaymentGatewayParams[];
      const reg = new RegExp(/^[-\w\s]+$/);
      for (const param of gateParams) {
        if (!param.value || !reg.test(param.value)) throw new UnprocessableEntityException('GATEWAY4');
      }
    }
    console.log({ dto });

    const item = await this.db.paymentGateway.update({
      where: { id },
      data: { is_active: dto.is_active },
    });

    return item;
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
