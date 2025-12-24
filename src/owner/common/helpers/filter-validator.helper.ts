import { Prisma } from '@prisma/client';
import { FindAllOwnerAdminDto } from 'src/owner/roles/admin/dto/find-all.dto';
import { filterPropsBuilder } from './model-props-builder.helper';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllOwnerAdminDto): Prisma.OwnerWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.OwnerWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page', 'skip'].includes(field)) return;

    //query
    switch (field) {
      case 'mobile_number':
        query = { ...query, user: { mobile_number: { contains: filters.mobile_number } } };
        break;

      case 'full_name':
        query = { ...query, user: { full_name: { contains: filters.full_name } } };
        break;

      case 'national_code':
        query = { ...query, national_code: filters.national_code };
        break;

      case 'status':
        query = { ...query, status: +filters.status };
        break;
      default:
        break;
    }
  }

  return query;
};
