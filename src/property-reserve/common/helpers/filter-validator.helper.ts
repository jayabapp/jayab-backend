import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllPropertyReserveAdminDto } from 'src/property-reserve/roles/admin/dto/find-all.dto';
import moment from 'moment-jalaali';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (
  filters: FindAllPropertyReserveAdminDto,
): Prisma.PropertyReserveWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.PropertyReserveWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) continue;

    //query
    switch (field) {
      case 'property_code':
        query = { ...query, property: { code: filters.property_code } };
        break;
      case 'user_mobile_number':
        query = { ...query, user: { mobile_number: filters.user_mobile_number } };
        break;
      case 'check_in':
        if (moment(filters.check_in).isValid()) query = { ...query, check_in: filters.check_in };
        break;

      default:
        break;
    }
  }

  return query;
};
