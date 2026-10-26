import { FindAllPropertyAdminDto } from 'src/property/roles/admin/dto/find-all.dto';
import { SubscriptionStatus } from 'src/subscription/common/subscription-status.type';
import { filterPropsBuilder } from './model-props-builder.helper';
import { PropertyStatuses } from '../types/property-status.type';
import { startOfDate } from 'src/common/helpers/date.helper';
import { Prisma } from '@prisma/client';

import moment from 'moment-jalaali';

export const filterValidator = (filters: FindAllPropertyAdminDto): Prisma.PropertyWhereInput => {
  if (!filters) return {};
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.PropertyWhereInput = {};

  for (const field of fields) {
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page', 'skip'].includes(field)) return;
    switch (field) {
      case 'owner_id':
        query = { ...query, owner_id: +filters.owner_id };
        break;

      case 'owner_mobile_number':
        query = {
          ...query,
          owner: { user: { mobile_number: { contains: filters.owner_mobile_number } } },
        };
        break;

      case 'status':
        if (+filters.status === PropertyStatuses.DELETED)
          query = { ...query, status: +filters.status, deleted_at: new Date() };
        else query = { ...query, status: +filters.status };
        break;

      case 'title':
        query = { ...query, title: { contains: filters.title } };
        break;

      case 'authorized':
        if (filters.authorized) query = { ...query, is_authorized: filters.authorized };
        break;
      case 'is_promoted':
        if (filters.is_promoted) query = { ...query, NOT: { promoted_at: null } };
        break;

      case 'paid_waiting_admin_approval':
        if (filters.paid_waiting_admin_approval)
          query = {
            ...query,
            status: PropertyStatuses.WAITING,
            subscriptions: { some: { status: SubscriptionStatus.SUCCESS } },
          };
        break;

      case 'expired':
        query = {
          ...query,
          subscription_expired_at: { lt: startOfDate(moment().toDate()) },
        };
        break;
      case 'code':
        query = { ...query, code: filters.code };
        break;
      default:
        break;
    }
  }

  return query;
};
