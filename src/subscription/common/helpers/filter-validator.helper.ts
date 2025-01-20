import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllSubscriptionAdminDto } from 'src/subscription/roles/admin/dto/find-all.dto';

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

    //query
    switch (field) {
      // case 'status':
      //   query = { ...query, status: +filters.status };
      //   break;
      case 'mobile_number':
        query = { ...query, advisor: { user: { mobile_number: { contains: filters.mobile_number } } } };
        break;

      case 'advisor_id':
        query = { ...query, advisor_id: +filters.advisor_id };
        break;

      case 'property_id':
        query = { ...query, property_id: +filters.property_id };
        break;
      // case 'user_fullname':
      //   query = { ...query, user: { full_name: { contains: filters.user_fullname } } };
      //   break;
      // case 'user_mobile':
      //   query = { ...query, user: { mobile_number: { contains: filters.user_mobile } } };
      //   break;

      default:
        break;
    }
  }

  return query;
};
