import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllMessengerChatroomAdminDto } from 'src/messenger-chatroom/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (
  filters: FindAllMessengerChatroomAdminDto,
): Prisma.MessengerChatroomWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.MessengerChatroomWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'property_title':
        query = { ...query, property: { title: { contains: filters.property_title, mode: 'insensitive' } } };
        break;
      case 'property_code':
        query = { ...query, property: { code: filters.property_code } };
        break;
      case 'property_id':
        query = { ...query, property_id: +filters.property_id };
        break;

      default:
        break;
    }
  }

  return query;
};
