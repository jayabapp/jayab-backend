import { buildPriceHistogram, HISTOGRAM_BIN_COUNT } from './price-histogram.helper';

describe('buildPriceHistogram', () => {
  it('has no bins at all when nothing is priced', () => {
    expect(buildPriceHistogram([])).toEqual({
      bins: [],
      min: null,
      max: null,
      total_priced: 0,
      currency: 'toman',
    });
    expect(buildPriceHistogram([null, undefined, 0, -5, Number.NaN, Infinity]).bins).toEqual([]);
  });

  it('makes one bin when every price is the same', () => {
    const histogram = buildPriceHistogram([5_000_000, 5_000_000, 5_000_000]);
    expect(histogram.bins).toEqual([{ from: 5_000_000, to: 5_000_000, count: 3 }]);
    expect(histogram).toMatchObject({ min: 5_000_000, max: 5_000_000, total_priced: 3 });
  });

  it('uses the real range, 20 bins, and counts add up to the priced total', () => {
    const prices = Array.from({ length: 997 }, (_, index) => 1_000_000 + index * 13_337);
    const histogram = buildPriceHistogram(prices);
    expect(histogram.bins).toHaveLength(HISTOGRAM_BIN_COUNT);
    expect(histogram.min).toBe(1_000_000);
    expect(histogram.max).toBe(1_000_000 + 996 * 13_337);
    expect(histogram.total_priced).toBe(997);
    expect(histogram.bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(997);
    expect(histogram.bins[0].from).toBe(histogram.min);
    expect(histogram.bins[19].to).toBe(histogram.max);
  });

  it('keeps bins contiguous and non-overlapping, with the maximum in the last bin', () => {
    const histogram = buildPriceHistogram([
      1_000, 2_000, 3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 9_000, 10_000,
    ]);
    for (let index = 1; index < histogram.bins.length; index++)
      expect(histogram.bins[index].from).toBe(histogram.bins[index - 1].to);
    const last = histogram.bins[histogram.bins.length - 1];
    expect(last.to).toBe(10_000);
    expect(last.count).toBeGreaterThanOrEqual(1);
  });

  it('puts a price exactly on an edge in the bin that starts there', () => {
    const histogram = buildPriceHistogram([100, 110, 120, 130, 140], 4);
    // 100..140 over 4 bins: edges 100,110,120,130,140
    expect(histogram.bins.map((bin) => bin.count)).toEqual([1, 1, 1, 2]);
  });

  it('uses fewer bins when the range is narrower than the bin count, never repeating an edge', () => {
    const histogram = buildPriceHistogram([100, 101, 103]);
    expect(histogram.bins.length).toBeLessThanOrEqual(3);
    const edges = [...histogram.bins.map((bin) => bin.from), histogram.bins[histogram.bins.length - 1].to];
    expect(new Set(edges).size).toBe(edges.length);
    expect(histogram.bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(3);
  });

  it('is not moved by prices above the old 40 million form limit', () => {
    const histogram = buildPriceHistogram([2_000_000, 90_000_000, 120_000_000]);
    expect(histogram.max).toBe(120_000_000);
    expect(histogram.bins[histogram.bins.length - 1].count).toBe(1);
  });
});
