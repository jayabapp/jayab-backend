import { Prisma } from '@prisma/client';
import { FindAllPropertyPhotoUpgradeRequestAdminDto } from 'src/property-photo-upgrade-request/roles/admin/dto/find-all.dto';
import { filterPropsBuilder } from './model-props-builder.helper';

export const filterValidator = (
  filters: FindAllPropertyPhotoUpgradeRequestAdminDto,
): Prisma.PropertyPhotoUpgradeRequestWhereInput => {
  if (!filters) return {};

  const items = filterPropsBuilder();
  const fields = Object.keys(filters).filter((e) => filters[e]);
  let query: Prisma.PropertyPhotoUpgradeRequestWhereInput = {};

  for (const field of fields) {
    const checkField = items.find((e) => e.state === field);
    if (!checkField && !['page', 'per_page', 'skip'].includes(field)) return;

    switch (field) {
      case 'status':
        query = { ...query, status: +filters.status };
        break;
      case 'property_id':
        query = { ...query, property_id: +filters.property_id };
        break;
      case 'owner_id':
        query = { ...query, owner_id: +filters.owner_id };
        break;
      case 'property_code':
        query = { ...query, property: { code: filters.property_code } };
        break;
      default:
        break;
    }
  }

  return query;
};
