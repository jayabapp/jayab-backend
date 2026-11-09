import { PropertyOptionGroup } from '../../../property-option/common/property-option-groups.type';
import {
  buildLocationSpans,
  buildMatchedOrder,
  buildSearchTokens,
  detectPool,
  LocationCandidate,
  LocationRow,
  matchLocationRows,
  matchOptions,
  residualWords,
  resolveLocation,
  SearchableOption,
} from './search-query-parser.helper';

const SHIRAZ = 10;
const FARS = 1;
const GUYUM = 100;
const OTHER_GUYUM = 200;

const OPTIONS: SearchableOption[] = [
  { id: 3, title: 'ویلا', group: PropertyOptionGroup.PROPERTY_TYPE },
  { id: 4, title: 'ویلا دوبلکس', group: PropertyOptionGroup.PROPERTY_TYPE },
  { id: 5, title: 'کلبه', group: PropertyOptionGroup.PROPERTY_TYPE },
  { id: 29, title: 'استخر روباز', group: PropertyOptionGroup.POOL_TYPE },
  { id: 30, title: 'استخر سرپوشیده', group: PropertyOptionGroup.POOL_TYPE },
  { id: 41, title: 'ساحلی', group: PropertyOptionGroup.PATTERN },
  { id: 55, title: 'جکوزی', group: PropertyOptionGroup.WELFARE },
  { id: 56, title: 'جکوزی', group: PropertyOptionGroup.ENTERTAINMENT },
];

const candidate = (overrides: Partial<LocationCandidate>): LocationCandidate => ({
  id: 0,
  title: '',
  parent_id: null,
  grandparent_id: null,
  start: 0,
  end: 0,
  ...overrides,
});

describe('search query parser', () => {
  it('decomposes the product example into ordered filters', () => {
    const tokens = buildSearchTokens('اجاره ویلا استخردار در گویم شیراز');

    const location = resolveLocation([
      candidate({ id: GUYUM, title: 'گویم', parent_id: SHIRAZ, grandparent_id: FARS, start: 4, end: 4 }),
      candidate({ id: SHIRAZ, title: 'شیراز', parent_id: FARS, start: 5, end: 5 }),
    ]);
    expect(location).toMatchObject({ key: 'regions', ids: [GUYUM], parentCityId: SHIRAZ });

    const pool = detectPool(tokens);
    expect(pool).toMatchObject({ value: 1, position: 2 });

    const consumed = new Set([...location.consumed, ...pool.consumed]);
    const options = matchOptions(tokens, consumed, OPTIONS);
    expect(options).toEqual([expect.objectContaining({ key: 'property_type', ids: [3], positions: [1] })]);

    options.forEach((match) => match.positions.forEach((position) => consumed.add(position)));
    expect(residualWords(tokens, consumed)).toEqual([]);

    const order = buildMatchedOrder([
      ...location.order,
      { key: 'has_pool', position: pool.position },
      ...options.map((match) => ({ key: match.key, position: match.positions[0] })),
    ]);
    expect(order).toEqual(['property_type', 'has_pool', 'regions', 'cities']);
  });

  it('prefers the namesake whose typed ancestor is also in the query', () => {
    const location = resolveLocation([
      candidate({ id: OTHER_GUYUM, title: 'گویم', parent_id: 999, grandparent_id: 998, start: 0, end: 0 }),
      candidate({ id: GUYUM, title: 'گویم', parent_id: SHIRAZ, grandparent_id: FARS, start: 0, end: 0 }),
      candidate({ id: SHIRAZ, title: 'شیراز', parent_id: FARS, start: 1, end: 1 }),
    ]);
    expect(location.ids).toEqual([GUYUM]);
  });

  it('lets the longest span win and widens same-level places', () => {
    const longest = resolveLocation([
      candidate({ id: 7, title: 'عباس', parent_id: 2, start: 1, end: 1 }),
      candidate({ id: 8, title: 'بندر عباس', parent_id: 2, start: 0, end: 1 }),
    ]);
    expect(longest).toMatchObject({ key: 'cities', ids: [8] });

    const widened = resolveLocation([
      candidate({ id: 20, title: 'رامسر', parent_id: 3, start: 0, end: 0 }),
      candidate({ id: 21, title: 'چالوس', parent_id: 3, start: 1, end: 1 }),
    ]);
    expect(widened).toMatchObject({ key: 'cities', ids: [20, 21] });
  });

  it('keeps an unrecognised name as residual text instead of dropping it', () => {
    const tokens = buildSearchTokens('ویلا سپیدار');
    const options = matchOptions(tokens, new Set(), OPTIONS);
    const consumed = new Set(options.flatMap((match) => match.positions));

    expect(options.map((match) => match.key)).toEqual(['property_type']);
    expect(residualWords(tokens, consumed)).toEqual([{ word: 'سپیدار', position: 1 }]);
  });

  it('does not turn a bare pool word into every pool type', () => {
    const tokens = buildSearchTokens('ویلا با استخر');
    const pool = detectPool(tokens);
    const options = matchOptions(tokens, new Set(pool.consumed), OPTIONS);

    expect(pool.value).toBe(1);
    expect(options.map((match) => match.key)).toEqual(['property_type']);
  });

  it('selects a specific pool type when its distinctive word is typed', () => {
    const tokens = buildSearchTokens('استخر سرپوشیده');
    const pool = detectPool(tokens);
    const options = matchOptions(tokens, new Set(pool.consumed), OPTIONS);

    expect(options).toEqual([expect.objectContaining({ key: 'pool_type', ids: [30] })]);
  });

  it('reads a negated pool as has_pool=0', () => {
    expect(detectPool(buildSearchTokens('ویلا بدون استخر'))).toMatchObject({ value: 0, position: 1 });
  });

  it('matches options through synonyms and consumes the typed phrase', () => {
    const tokens = buildSearchTokens('ویلایی لب دریا');
    const options = matchOptions(tokens, new Set(), OPTIONS);
    const consumed = new Set(options.flatMap((match) => match.positions));

    expect(options.map((match) => match.key)).toEqual(['property_type', 'pattern']);
    expect(residualWords(tokens, consumed)).toEqual([]);
  });

  it('feeds a word shared by two groups to the higher-priority group only', () => {
    const options = matchOptions(buildSearchTokens('جکوزی'), new Set(), OPTIONS);
    expect(options.map((match) => match.key)).toEqual(['entertainment']);
  });

  it('requires every word of a property type title', () => {
    const options = matchOptions(buildSearchTokens('ویلا دوبلکس'), new Set(), OPTIONS);
    expect(options).toEqual([expect.objectContaining({ key: 'property_type', ids: [4] })]);
  });

  it('never builds a location span across a stopword or a consumed word', () => {
    const spans = buildLocationSpans(buildSearchTokens('ویلا در بندر عباس'), new Set([0]));
    expect(spans.map((span) => span.text)).toEqual(['بندر', 'بندر عباس', 'عباس']);
  });

  it('reads the "villa of" form of villa as the villa type', () => {
    const tokens = buildSearchTokens('ویلای رامسر');
    const options = matchOptions(tokens, new Set(), OPTIONS);

    expect(options).toEqual([expect.objectContaining({ key: 'property_type', ids: [3], positions: [0] })]);
  });
});

describe('location rows', () => {
  const RAMSAR = 81;
  const MAZANDARAN = 34;
  const ramsar: LocationRow = {
    id: RAMSAR,
    title: 'رامسر',
    translations: { en: { title: 'Ramsar' }, ar: { title: 'رامسر' } },
    parent_id: MAZANDARAN,
    grandparent_id: null,
  };
  const span = (text: string, start = 0, end = start): { text: string; start: number; end: number } => ({
    text,
    start,
    end,
  });

  it.each(['رامسر', 'Ramsar', 'RAMSAR', 'ramsar'])('matches %s to the city', (text) => {
    expect(matchLocationRows([span(text)], [ramsar])).toEqual([
      { id: RAMSAR, title: 'رامسر', parent_id: MAZANDARAN, grandparent_id: null, start: 0, end: 0 },
    ]);
  });

  it('matches across Arabic letter forms, joiners and stored spacing', () => {
    const zwnj = String.fromCharCode(0x200c);
    const row = (id: number, title: string, translations: unknown = null): LocationRow => ({
      id,
      title,
      translations,
      parent_id: 1,
      grandparent_id: null,
    });

    expect(matchLocationRows([span('کرج')], [row(1, 'كرج ')])).toHaveLength(1);
    expect(matchLocationRows([span('اسلامشهر')], [row(2, `اسلام${zwnj}شهر`)])).toHaveLength(1);
    expect(matchLocationRows([span('أصفهان')], [row(3, 'اصفهان', { ar: { title: 'أصفهان' } })])).toHaveLength(1);
  });

  it('ignores partial and unknown names and tolerates malformed translations', () => {
    const malformed: LocationRow[] = [
      { ...ramsar, id: 1, title: 'یک', translations: { en: 'Ramsar', ar: null } },
      { ...ramsar, id: 2, title: 'دو', translations: ['Ramsar'] },
      { ...ramsar, id: 3, title: 'سه', translations: { en: { title: 42 } } },
    ];

    expect(matchLocationRows([span('رام')], [ramsar])).toEqual([]);
    expect(matchLocationRows([span('ناشناخته')], [ramsar])).toEqual([]);
    expect(matchLocationRows([span('Ramsar')], malformed)).toEqual([]);
    expect(matchLocationRows([], [ramsar])).toEqual([]);
  });

  it('consumes a place typed twice instead of leaving the repeat as title text', () => {
    const tokens = buildSearchTokens('  رامسر   رامسر ');
    const location = resolveLocation(matchLocationRows(buildLocationSpans(tokens), [ramsar]));

    expect(location).toMatchObject({ key: 'cities', ids: [RAMSAR] });
    expect(residualWords(tokens, new Set(location.consumed))).toEqual([]);
  });

  it('keeps the city and leaves rent words and unknown words for the caller', () => {
    const tokens = buildSearchTokens('اجاره خانه ویلای رامسر!');
    const location = resolveLocation(matchLocationRows(buildLocationSpans(tokens), [ramsar]));

    expect(location).toMatchObject({ key: 'cities', ids: [RAMSAR], consumed: [3] });
    const options = matchOptions(tokens, new Set(location.consumed), OPTIONS);
    expect(options.map((match) => match.key)).toEqual(['property_type']);
    const consumed = new Set([...location.consumed, ...options.flatMap((match) => match.positions)]);
    expect(residualWords(tokens, consumed).map(({ word }) => word)).toEqual(['خانه']);
  });
});
