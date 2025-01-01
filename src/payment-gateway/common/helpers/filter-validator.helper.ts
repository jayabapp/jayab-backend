import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllPaymentGatewayAdminDto } from 'src/payment-gateway/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllPaymentGatewayAdminDto): Prisma.PaymentGatewayWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.PaymentGatewayWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      // case 'status':
      //   query = { ...query, status: +filters.status };
      //   break;
      case 'user_id':
        // query = { ...query, user_id: +filters.user_id };
        break;
      // case 'user_fullname':
      //   query = { ...query, user: { full_name: { contains: filters.user_fullname } } };
      //   break;
      // case 'user_mobile':
      //   query = { ...query, user: { mobile_number: { contains: filters.user_mobile } } };
      //   break;

      default:
        break;
    }
  }

  return query;
};
