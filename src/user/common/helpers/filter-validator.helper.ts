import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { FindAllUserAdminDto } from 'src/user/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllUserAdminDto): Prisma.UserWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.UserWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      // case 'full_name':
      //   query = { ...query, full_name: { contains: filters.full_name, mode: 'insensitive' } };
      //   break;
      case 'mobile_number':
        query = { ...query, mobile_number: { contains: filters.mobile_number, mode: 'insensitive' } };
        break;
      case 'is_banned':
        if (filters.is_banned) query = { ...query, is_banned: true };
        break;

      default:
        break;
    }
  }

  return query;
};
