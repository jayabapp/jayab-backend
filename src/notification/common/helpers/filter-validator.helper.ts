import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllSentNotificationAdminDto } from 'src/notification/roles/admin/dto/find-all.dto';
import { NotificationSourceFilter } from '../notification-source.type';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllSentNotificationAdminDto): Prisma.NotificationWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.NotificationWhereInput = { is_sent_by_admin: true };

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'mobile_number':
        query.user = { mobile_number: { contains: filters.mobile_number } };
        break;

      case 'source':
        if (filters.source === NotificationSourceFilter.SYSTEM) query.is_sent_by_admin = false;
        if (filters.source === NotificationSourceFilter.ALL) delete query.is_sent_by_admin;
        break;

      default:
        break;
    }
  }

  return query;
};
