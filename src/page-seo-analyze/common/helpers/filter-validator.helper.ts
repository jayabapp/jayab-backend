import { Prisma } from '@prisma/client';
import { filterPropsBuilder } from './model-props-builder.helper';
import { FindAllPageSeoAnalyzeAdminDto } from 'src/page-seo-analyze/roles/admin/dto/find-all.dto';
import { SeoParamsLimit } from '../interfaces/seo-params-limit.enum';
import { isEmpty } from 'lodash';

/**
 * validate filters
 * @param dto
 * @returns
 */
export const filterValidator = (filters: FindAllPageSeoAnalyzeAdminDto): Prisma.PageSeoAnalyzeWhereInput => {
  if (!filters) return {};

  /**
   * get items for checking fields and operators
   * filter keys must be in items filerItems array
   * filter field keys must be in items operators array
   */
  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);

  // eslint-disable-next-line
  let query: Prisma.PageSeoAnalyzeWhereInput = {};
  let queryOR: any[] = [];

  for (const field of fields) {
    /**
     * check filter keys
     */
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page'].includes(field)) return;

    //query
    switch (field) {
      case 'url':
        query = { ...query, url: { contains: filters.url } };
        break;
      case 'title_issue':
        if (filters.title_issue)
          queryOR.push(
            { meta_title_length: { gt: SeoParamsLimit.MAX_TITLE_LENGTH } },
            { meta_title_length: { lt: SeoParamsLimit.MIN_TITLE_LENGTH } },
          );
        break;
      case 'description_issue':
        if (filters.description_issue)
          queryOR.push(
            { meta_description_length: { gt: SeoParamsLimit.MAX_DESCRIPTION_LENGTH } },
            { meta_description_length: { lt: SeoParamsLimit.MIN_DESCRIPTION_LENGTH } },
          );

        break;
      case 'without_h1':
        if (filters.without_h1) query = { ...query, h1_count: 0 };
        break;
      case 'h1_issue':
        if (filters.h1_issue) query = { ...query, h1_count: { gt: 1 } };
        break;
      case 'alt_image_issue':
        if (filters.alt_image_issue) query = { ...query, NOT: { no_alt_images: { isEmpty: true } } };
        break;

      default:
        break;
    }
  }

  if (!isEmpty(queryOR)) query = { ...query, OR: queryOR };

  return query;
};
