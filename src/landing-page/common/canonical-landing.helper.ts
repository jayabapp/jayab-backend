import { PrismaService } from 'src/prisma/prisma.service';

type LandingLocation = {
  cityId?: number;
  provinceId?: number;
};

const specificityScore = (landing: {
  has_pool: boolean;
  is_premium: boolean;
  max_bedroom: number | null;
  max_price: number | null;
  min_bedroom: number | null;
  min_discount_percentage: number | null;
  min_price: number | null;
  options: number[];
  property_type: number | null;
}): number =>
  landing.options.length +
  Number(landing.has_pool) +
  Number(landing.is_premium) +
  Number(Boolean(landing.property_type)) +
  Number(Boolean(landing.min_discount_percentage)) +
  Number(Boolean(landing.min_price)) +
  Number(Boolean(landing.max_price)) +
  Number(Boolean(landing.min_bedroom)) +
  Number(Boolean(landing.max_bedroom));

export const findCanonicalLocationLanding = async (
  db: PrismaService,
  { cityId, provinceId }: LandingLocation,
): Promise<string | null> => {
  if (!cityId && !provinceId) return null;

  const candidates = await db.landingPage.findMany({
    where: {
      is_active: true,
      main_content_id: { not: null },
      ...(cityId ? { cities: { has: cityId } } : { province_id: provinceId }),
    },
    select: {
      id: true,
      url: true,
      has_pool: true,
      is_premium: true,
      max_bedroom: true,
      max_price: true,
      min_bedroom: true,
      min_discount_percentage: true,
      min_price: true,
      options: true,
      property_type: true,
      sort_order: true,
    },
    orderBy: [{ sort_order: { sort: 'asc', nulls: 'last' } }, { id: 'asc' }],
  });

  return (
    candidates.sort((first, second) => specificityScore(first) - specificityScore(second))[0]?.url ?? null
  );
};
