export const HISTOGRAM_BIN_COUNT = 20;

export type PriceHistogramBin = { from: number; to: number; count: number };

export type PriceHistogram = {
  currency: 'toman';
  min: number | null;
  max: number | null;
  total_priced: number;
  bins: PriceHistogramBin[];
};

const isPrice = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

export const buildPriceHistogram = (
  prices: Array<number | null | undefined>,
  maxBins: number = HISTOGRAM_BIN_COUNT,
): PriceHistogram => {
  const valid = prices.filter(isPrice);
  if (valid.length === 0) return { bins: [], min: null, max: null, total_priced: 0, currency: 'toman' };
  let min = Infinity;
  let max = -Infinity;
  for (const price of valid) {
    min = Math.min(min, price);
    max = Math.max(max, price);
  }

  const binCount = max === min ? 1 : Math.min(maxBins, Math.floor(max - min));
  const edges = Array.from({ length: binCount + 1 }, (_, index) =>
    index === binCount ? max : Math.round(min + ((max - min) * index) / binCount),
  );
  const counts = new Array<number>(binCount).fill(0);

  for (const price of valid) {
    let index = binCount - 1;
    for (let candidate = 0; candidate < binCount - 1; candidate++) {
      if (price < edges[candidate + 1]) {
        index = candidate;
        break;
      }
    }
    counts[index]++;
  }

  return {
    bins: counts.map((count, index) => ({ from: edges[index], to: edges[index + 1], count })),
    min,
    max,
    total_priced: valid.length,
    currency: 'toman',
  };
};
