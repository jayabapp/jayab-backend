import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { operators } from 'src/common/utils/constants/filter-operators.constant';
import { FindAllContentQuestionAdminDto } from 'src/content-question/roles/admin/dto/find-all.dto';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (
  filters: FindAllContentQuestionAdminDto,
): Prisma.ContentQuestionWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.ContentQuestionWhereInput = {};

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
      case 'question':
        query = { ...query, question: { contains: filters.question } };
        break;
      case 'not_answered':
        if (filters.not_answered) query = { ...query, answer: null };
        break;
      case 'is_not_published':
        if (filters.is_not_published) query = { ...query, is_publish: false };
        break;

      default:
        break;
    }
  }

  return query;
};
