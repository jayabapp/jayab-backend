import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllContentAdminDto } from 'src/content/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllContentAdminDto): Prisma.ContentWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder([]);
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.ContentWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'title':
        if (filters.title == '') break;
        query = { ...query, title: { contains: filters.title, mode: 'insensitive' } };
        break;
      case 'small_text':
        query = { ...query, small_text: { contains: filters.small_text, mode: 'insensitive' } };
        break;
      case 'key':
        query = { ...query, key: { contains: filters.key, mode: 'insensitive' } };
        break;
      case 'category_id':
        query = { ...query, category_id: +filters.category_id };
        break;

      default:
        break;
    }
  }

  return query;
};
