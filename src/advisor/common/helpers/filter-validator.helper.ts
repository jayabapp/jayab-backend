import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllAdvisorAdminDto } from 'src/advisor/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllAdvisorAdminDto): Prisma.AdvisorWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.AdvisorWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'mobile_number':
        query = { ...query, user: { mobile_number: { contains: filters.mobile_number } } };
        break;

      case 'full_name':
        query = { ...query, user: { full_name: { contains: filters.full_name } } };
        break;

      case 'status':
        query = { ...query, status: +filters.status };
        break;

      case 'no_sub':
        if (filters.no_sub) query = { ...query, subscription_expired_at: null };
        break;

      case 'is_special':
        if (filters.is_special) query = { ...query, is_special: filters.is_special };
        else query = { ...query };
        break;

      case 'national_code':
        query = { ...query, national_code: filters.national_code };
        break;

      default:
        break;
    }
  }

  return query;
};
