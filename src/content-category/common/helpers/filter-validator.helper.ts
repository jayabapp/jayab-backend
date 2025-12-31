import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllContentCategoryAdminDto } from 'src/content-category/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (
  filters: FindAllContentCategoryAdminDto,
): Prisma.ContentCategoryWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder([]);
  const fields = Object.keys(filters);

  // eslint-disable-next-line
  let query: Prisma.ContentCategoryWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);

    if (!checkField && !['page', 'per_page'].includes(field)) continue;

    //query
    switch (field) {
      case 'title':
        if (filters.title == '') break;
        else query = { ...query, title: { contains: filters.title, mode: 'insensitive' } };
        break;

      case 'key':
        query = { ...query, key: { contains: filters.key, mode: 'insensitive' } };
        break;

      default:
        break;
    }
  }

  return query;
};
