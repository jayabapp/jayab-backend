import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: object): object | undefined => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters);

  // eslint-disable-next-line
  let query: Prisma.BaseWhereInput = {};

  for (const field of fields) {
    /**
     * check filter keys
     * ex:({ title: { equals: "test title" }, id: { gt: 1, lt: 10 } })
     */
    const checkField = items.find((e) => e.key === field);
    if (!checkField) return;

    /**
     * check operators of the key
     * ex:({ equals: "test title" })
     */
    const operator = Object.keys(filters[field])?.[0];

    const checkOperator = checkField.operators?.find((e) => e.operator === operator);
    if (!checkOperator) return;

    // the type of value must be string or number. object, json and any other type are not valid
    let value = filters[field][operator];
    if (value == null || value == undefined) return;
    if (!['string', 'number'].includes(typeof value)) return;
    if (value == 'null') value = null;

    /**
     * if the value is number string, it must convert to the number type because of prisma query
     * the value type must exists in default operator types
     */
    if (
      !isNaN(value) &&
      checkOperator.types.includes('number') &&
      ['select', 'number'].includes(checkField.type)
    )
      value = parseInt(value);
    if (!checkOperator?.types.includes(typeof value)) return;

    switch (field) {
      case 'title':
        if (value == '') break;
        // else query = { ...query, title: { contains: value, mode: 'insensitive' } };
        break;

      default:
        break;
    }
  }

  return query;
};
