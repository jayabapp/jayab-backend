import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { FindAllTicketAdminDto } from 'src/ticket/roles/admin/dto/find-all-ticket-admin.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllTicketAdminDto): Prisma.TicketWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.TicketWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'user_mobile_number':
        query = {
          ...query,
          user: { mobile_number: { contains: filters.user_mobile_number } },
        };
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
