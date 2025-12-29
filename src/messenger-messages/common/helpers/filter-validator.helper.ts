import { Prisma } from '@prisma/client';
import { FindAllMessengerMessagesAdminDto } from 'src/messenger-messages/roles/admin/dto/find-all.dto';
import { filterPropsBuilder } from './model-props-builder.helper';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (
  filters: FindAllMessengerMessagesAdminDto,
): Prisma.MessengerMessagesWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.MessengerMessagesWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page', 'skip'].includes(field)) return;

    //query
    switch (field) {
      case 'chatroom_id':
        query = { ...query, chatroom_id: +filters.chatroom_id };
        break;

      default:
        break;
    }
  }

  return query;
};
