import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

const ModelsWithSoftDelete = [
  'City',
  'Category',
  'OfferCode',
  'FormBuilder',
  'Property',
  'PropertyOption',
  'SubscriptionPlan',
];

const isSoftDeleteModel = (model: string, args: any): boolean => {
  return ModelsWithSoftDelete.includes(model);
};

// Create an extended Prisma client instance
const extendedClient = new PrismaClient().$extends({
  query: {
    $allModels: {
      findMany({ model, args, query }) {
        if (isSoftDeleteModel(model, args) && args?.where?.['deleted_at'] == undefined) {
          args.where = { ...args.where, deleted_at: null };
        }
        return query(args);
      },
      findFirst({ model, args, query }) {
        if (isSoftDeleteModel(model, args) && args?.where?.['deleted_at'] == undefined) {
          args.where = { ...args.where, deleted_at: null };
        }
        return query(args);
      },
      findUnique({ model, args, query }) {
        if (isSoftDeleteModel(model, args) && args?.where?.['deleted_at'] == undefined) {
          args.where = { ...args.where, deleted_at: null };
        }
        return query(args);
      },
      delete({ model, args }) {
        if (isSoftDeleteModel(model, args)) {
          return (extendedClient as any)[model].update({
            where: args.where,
            data: { deleted_at: new Date() },
          });
        }
        return (extendedClient as any)[model].delete(args);
      },
      deleteMany({ model, args }) {
        if (isSoftDeleteModel(model, args)) {
          return (extendedClient as any)[model].updateMany({
            where: args.where,
            data: { deleted_at: new Date() },
          });
        }
        return (extendedClient as any)[model].deleteMany(args);
      },
    },
  },
});

@Injectable()
export class PrismaService extends (PrismaClient as any) implements OnModuleInit {
  constructor() {
    // @ts-ignore: assign extended instance to this
    super();
    Object.assign(this, extendedClient);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
