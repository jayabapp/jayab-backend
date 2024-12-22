import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllContentAdminDto } from 'src/content/roles/admin/dto/find-all.dto';
import { FindAllFormBuilderAdminDto } from 'src/form-builder/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllFormBuilderAdminDto): Prisma.FormBuilderWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters);

  // eslint-disable-next-line
  let query: Prisma.FormBuilderWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'content_id':
        query = { ...query, content_id: +filters.content_id };
        break;

      default:
        break;
    }
  }

  return query;
};
