import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllSubscriptionAdminDto } from 'src/subscription/roles/admin/dto/find-all.dto';
import moment from 'moment-jalaali';
import { JALAALI_FORMAT } from 'src/common/utils/constants/date.constant';
import { convertJalaaliDtoToDate, startOfDate } from 'src/common/helpers/date.helper';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllSubscriptionAdminDto): Prisma.SubscriptionWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.SubscriptionWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    const { from_date, to_date } = filters;

    const fromDate = from_date ? convertJalaaliDtoToDate(from_date) : null;
    const toDate = to_date ? convertJalaaliDtoToDate(to_date) : null;

    if (fromDate && toDate)
      query = { ...query, AND: [{ created_at: { gte: fromDate } }, { created_at: { lte: toDate } }] };
    else if (fromDate) query = { ...query, created_at: { gte: fromDate } };
    else if (toDate) query = { ...query, created_at: { lte: toDate } };

    //query
    switch (field) {
      case 'mobile_number':
        query = {
          ...query,
          OR: [
            { advisor: { user: { mobile_number: { contains: filters.mobile_number } } } },
            { property: { owner: { user: { mobile_number: { contains: filters.mobile_number } } } } },
          ],
        };
        break;

      case 'advisor_id':
        query = { ...query, advisor_id: +filters.advisor_id };
        break;

      case 'property_id':
        query = { ...query, property_id: +filters.property_id };
        break;
      case 'type':
        if (filters.type === 'property') {
          if (filters.property_id) break;
          query = { ...query, property_id: { gt: 0 } };
        } else if (filters.type === 'advisor') query = { ...query, advisor_id: { gt: 0 } };
        break;

      case 'extra_type':
        if (filters.extra_type === 'is_renew')
          query = { ...query, is_promote: false, property_id: { gt: 0 } };
        else if (filters.extra_type === 'is_normal_advisor')
          query = { ...query, is_special_advisor: false, advisor_id: { gt: 0 } };
        else query = { ...query, [filters.extra_type]: true };
        break;
      case 'from_date':
      case 'to_date':
        break;

      default:
        break;
    }
  }

  return query;
};
