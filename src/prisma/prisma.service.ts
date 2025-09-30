import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { camelCase } from 'lodash';

const ModelsWithSoftDelete = [
  'City',
  'Category',
  'FormBuilder',
  'Property',
  'PropertyOption',
  'SubscriptionPlan',
] as const;

const modelMap: Record<string, keyof PrismaClient> = {
  City: 'city',
  Category: 'category',
  FormBuilder: 'formBuilder',
  Property: 'property',
  PropertyOption: 'propertyOption',
  SubscriptionPlan: 'subscriptionPlan',
};

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super();

    const extended = this.$extends({
      query: {
        $allModels: {
          findMany({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any) && args?.where?.['deleted_at'] == undefined) {
              args.where = { ...args.where, deleted_at: null };
            } else delete args.where?.['deleted_at'];
            return query(args);
          },

          findFirst({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any) && args?.where?.['deleted_at'] == undefined) {
              args.where = { ...args.where, deleted_at: null };
            } else delete args.where?.['deleted_at'];
            return query(args);
          },

          //@ts-ignore
          findUnique({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any) && args?.where?.['deleted_at'] == undefined) {
              args.where = { ...args.where, deleted_at: null };
            } else delete args.where?.['deleted_at'];
            return query(args);
          },

          //@ts-ignore
          delete({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any)) {
              return extended[modelMap[model]].update({
                where: args.where,
                data: { deleted_at: new Date() },
              });
            }
            return query(args);
          },

          deleteMany({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any)) {
              return extended[modelMap[model]].updateMany({
                where: args.where,
                data: { deleted_at: new Date() },
              });
            }
            return query(args);
          },
          count({ model, args, query }) {
            if (ModelsWithSoftDelete.includes(model as any)) {
              args.where = { ...args.where, deleted_at: null };
            } else delete args.where?.['deleted_at'];
            return query(args);
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
