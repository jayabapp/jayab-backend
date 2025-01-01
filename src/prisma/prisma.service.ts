import { Injectable, OnModuleInit } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

const ModelsWithSoftDelete = [
  'City',
  'Category',
  'OfferCode',
  'FormBuilder',
  'Property',
  'PropertyOption',
  'SubscriptionPlan',
];

const prisma = new PrismaClient().$extends({
  model: {
    turnover: {
      // async createWithBalanceUpdate(data: Prisma.TurnoverUncheckedCreateInput) {
      //   const { user_id } = data;
      //   let turnover;
      //   await prisma.$transaction(async (tx) => {
      //     turnover = await tx.turnover.create({ data });
      //     const aggregate = await tx.turnover.aggregate({
      //       where: { user_id: user_id },
      //       _sum: { amount: true },
      //     });
      //     await tx.user.update({
      //       where: { id: user_id },
      //       data: {
      //         wallet_balance: aggregate._sum.amount,
      //       },
      //     });
      //   });
      //   return turnover;
      // },
    },
  },
});

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();
  }

  async onModuleInit(): Promise<void> {
    /* -------------------------------------------------------------------------- */
    /*                                 SOFT DELETE                                */
    /* -------------------------------------------------------------------------- */
    this.$use(async (params, next) => {
      if (!ModelsWithSoftDelete.includes(params.model)) return next(params);

      if (params.action === 'findUnique' || params.action === 'findFirst') {
        params.action = 'findFirst';
      }
      if (['findFirst', 'findMany', 'count'].includes(params.action)) {
        if (!params.args) params.args = {};
        if (!params.args?.where) params.args.where = {};
        if (params.args.where.deleted_at == undefined) params.args.where['deleted_at'] = null;
        else delete params.args.where['deleted_at'];
      }
      return next(params);
    });
    // Delete queries
    this.$use(async (params, next) => {
      //ignore models without soft-delete capability
      if (!ModelsWithSoftDelete.includes(params.model)) return next(params);

      if (params.action == 'delete') {
        // Change action to an update
        params.action = 'update';
        params.args['data'] = { deleted_at: new Date() };
      }
      return next(params);
    });
    /* -------------------------------------------------------------------------- */
    /*                               END SOFT DELETE                              */
    /* -------------------------------------------------------------------------- */
  }

  // Expose the extended Prisma client with custom methods
  get client() {
    return prisma;
  }
}
