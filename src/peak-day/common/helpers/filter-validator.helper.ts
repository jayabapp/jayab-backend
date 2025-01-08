import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllPeakDayAdminDto } from 'src/peak-day/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllPeakDayAdminDto): Prisma.PeakDayWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.PeakDayWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'month':
        query = { ...query, month: +filters.month };
        break;
      case 'year':
        query = { ...query, year: +filters.year };
        break;

      default:
        break;
    }
  }

  return query;
};
