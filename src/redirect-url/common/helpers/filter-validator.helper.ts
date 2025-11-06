import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { FindAllRedirectUrlAdminDto } from 'src/redirect-url/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllRedirectUrlAdminDto): Prisma.RedirectUrlWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.RedirectUrlWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'source':
        query = { ...query, source: { contains: filters.source, mode: 'insensitive' } };
        break;
      case 'destination':
        query = { ...query, destination: { contains: filters.destination, mode: 'insensitive' } };
        break;

      default:
        break;
    }
  }

  return query;
};
