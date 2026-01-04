import { Prisma } from '@prisma/client';
import { FindAllPropertyReportAdminDto } from 'src/property-report/roles/admin/dto/find-all.dto';
import { filterPropsBuilder } from './model-props-builder.helper';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllPropertyReportAdminDto): Prisma.PropertyReportWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.PropertyReportWhereInput = {};

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
      case 'seen_by_admin':
        query = { ...query, seen_by_admin: filters?.seen_by_admin == 2 ? true : false };
        break;

      case 'property_id':
        query = { ...query, property_id: +filters?.property_id };
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
