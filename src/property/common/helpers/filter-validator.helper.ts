import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllPropertyAdminDto } from 'src/property/roles/admin/dto/find-all.dto';
import moment from 'moment-jalaali';
import { startOfDate } from 'src/common/helpers/date.helper';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllPropertyAdminDto): Prisma.PropertyWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.PropertyWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'owner_id':
        query = { ...query, owner_id: +filters.owner_id };
        break;

      case 'status':
        query = { ...query, status: +filters.status };
        break;

      case 'title':
        query = { ...query, title: { contains: filters.title } };
        break;

      case 'authorized':
        if (filters.authorized) query = { ...query, is_authorized: filters.authorized };
        break;

      case 'expired':
        query = {
          ...query,
          OR: [
            { subscription_expired_at: { lt: startOfDate(moment().toDate()) } },
            { subscription_expired_at: null },
          ],
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
