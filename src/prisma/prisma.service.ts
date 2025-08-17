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
] as const;

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();

    // Extend only query behavior for soft delete
    const extended = this.$extends({
      query: {
        $allModels: {
          findMany({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any) && args?.where?.['deleted_at'] == undefined) {
              args.where = { ...args.where, deleted_at: null };
            }
            return query(args);
          },

          findFirst({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any) && args?.where?.['deleted_at'] == undefined) {
              args.where = { ...args.where, deleted_at: null };
            }
            return query(args);
          },

          findUnique({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any) && args?.where?.['deleted_at'] == undefined) {
              args.where = { ...args.where, deleted_at: null };
            }
            return query(args);
          },

          delete({ model, args }) {
            if (ModelsWithSoftDelete.includes(model as any)) {
              return (this as any)[model].update({
                where: args.where,
                data: { deleted_at: new Date() },
              });
            }
            return (this as any)[model].delete(args);
          },

          deleteMany({ model, args }) {
            if (ModelsWithSoftDelete.includes(model as any)) {
              return (this as any)[model].updateMany({
                where: args.where,
                data: { deleted_at: new Date() },
              });
            }
            return (this as any)[model].deleteMany(args);
          },
        },
      },
    });

    // Merge the extended client back into this
    Object.assign(this, extended);
  }

  async onModuleInit() {
    await this.$connect();
  }
}
