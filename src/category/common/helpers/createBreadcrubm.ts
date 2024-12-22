import { Category } from '@prisma/client';

/**
 * create breadcrumb
 */
type CategoryWithParent = Category & { parent: Category };

const createCategoryBreadcrumb = (category: CategoryWithParent) => {
  let breadcrumb = [];
  let level = category as CategoryWithParent;
  for (let i = 0; i < 4; i++) {
    if (level) {
      breadcrumb.push({ id: level.id, title: level.title });
      level = level.parent as Category & { parent: Category };
    }
  }
  return breadcrumb.reverse();
};

export default createCategoryBreadcrumb;
