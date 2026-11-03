import { PropertyOptionGroup } from '../../../property-option/common/property-option-groups.type';
import { tokenizeSearchText } from './search-text.helper';

export type SearchToken = {
  word: string;
  position: number;
  virtual: boolean;
  sources: number[];
  stopword: boolean;
};

export type LocationLevel = 'province' | 'city' | 'region';
export type LocationKey = 'provinces' | 'cities' | 'regions';

export type LocationCandidate = {
  id: number;
  end: number;
  title: string;
  start: number;
  parent_id: number | null;
  grandparent_id: number | null;
};

export type ResolvedLocation = {
  ids: number[];
  key: LocationKey;
  consumed: number[];
  order: MatchedEntry[];
  parentCityId: number | null;
};

export type SearchableOption = { id: number; title: string; group: string };

export type OptionMatch = {
  key: string;
  ids: number[];
  words: string[];
  positions: number[];
};

export type MatchedEntry = { key: string; position: number };

export const LOCATION_SPAN_MAX_WORDS = 3;

export const SEARCH_STOPWORDS = new Set([
  'اجاره',
  'کرایه',
  'رزرو',
  'در',
  'با',
  'برای',
  'به',
  'از',
  'یا',
  'تا',
  'نزدیک',
  'اقامتگاه',
  'اقامت',
  'محله',
  'منطقه',
  'شهر',
  'استان',
  'دارای',
  'دار',
  'ها',
  'های',
  'بدون',
]);

export const SEARCH_SYNONYMS: Record<string, string> = {
  بیلیار: 'بیلیارد',
  ویلایی: 'ویلا',
  سوییت: 'سوئیت',
  'لب دریا': 'ساحلی',
  'کنار دریا': 'ساحلی',
  ساحل: 'ساحلی',
  دریا: 'ساحلی',
  جنگل: 'جنگلی',
  کوه: 'کوهستانی',
  کوهستان: 'کوهستانی',
  پت: 'حیوان',
};

const POOL_PREFIX = 'استخر';
const NEGATION_WORD = 'بدون';

const GENERIC_OPTION_WORDS = new Set(['استخر', 'امکانات', 'سیستم', 'وسایل', 'فضای', 'مجاز', 'ممنوع']);

export const SEARCHABLE_OPTION_GROUPS: readonly string[] = [
  PropertyOptionGroup.PROPERTY_TYPE,
  PropertyOptionGroup.POOL_TYPE,
  PropertyOptionGroup.PATTERN,
  PropertyOptionGroup.ENTERTAINMENT,
  PropertyOptionGroup.WELFARE,
  PropertyOptionGroup.COOL_HEAT,
  PropertyOptionGroup.KITCHEN,
  PropertyOptionGroup.OWNERSHIP,
  PropertyOptionGroup.PARTY,
  PropertyOptionGroup.PET,
];

const STRICT_OPTION_GROUPS = new Set<string>([
  PropertyOptionGroup.PROPERTY_TYPE,
  PropertyOptionGroup.WELFARE,
  PropertyOptionGroup.COOL_HEAT,
  PropertyOptionGroup.KITCHEN,
  PropertyOptionGroup.PARTY,
  PropertyOptionGroup.PET,
]);

export const buildSearchTokens = (query: string): SearchToken[] => {
  const words = tokenizeSearchText(query);
  const tokens: SearchToken[] = words.map((word, position) => ({
    word,
    position,
    sources: [position],
    virtual: false,
    stopword: SEARCH_STOPWORDS.has(word),
  }));

  for (let start = 0; start < words.length; start++) {
    for (const length of [2, 1]) {
      const end = start + length - 1;
      if (end >= words.length) continue;
      const phrase = words.slice(start, end + 1).join(' ');
      const canonical = SEARCH_SYNONYMS[phrase];
      if (!canonical || canonical === phrase) continue;
      tokens.push({
        word: canonical,
        position: start,
        sources: Array.from({ length }, (_, offset) => start + offset),
        virtual: true,
        stopword: false,
      });
    }
  }

  return tokens;
};

const originals = (tokens: SearchToken[]): SearchToken[] => tokens.filter((token) => !token.virtual);

export const buildLocationSpans = (
  tokens: SearchToken[],
  consumed: ReadonlySet<number> = new Set(),
): { text: string; start: number; end: number }[] => {
  const words = originals(tokens);
  const spans: { text: string; start: number; end: number }[] = [];
  for (let start = 0; start < words.length; start++) {
    for (let end = start; end < Math.min(words.length, start + LOCATION_SPAN_MAX_WORDS); end++) {
      const run = words.slice(start, end + 1);
      if (run.some((token) => token.stopword || consumed.has(token.position))) break;
      spans.push({ text: run.map((token) => token.word).join(' '), start, end });
    }
  }
  return spans;
};

export const detectPool = (
  tokens: SearchToken[],
): { value: 0 | 1; position: number; consumed: number[] } | null => {
  const words = originals(tokens);
  const poolToken = words.find((token) => token.word.startsWith(POOL_PREFIX));
  if (!poolToken) return null;

  const previous = words[poolToken.position - 1];
  const next = words[poolToken.position + 1];
  const consumed = [poolToken.position];
  if (next?.word === 'دار') consumed.push(next.position);
  const isNegated = previous?.word === NEGATION_WORD;
  if (isNegated) consumed.push(previous.position);

  return {
    value: isNegated ? 0 : 1,
    position: isNegated ? previous.position : poolToken.position,
    consumed,
  };
};

const levelOf = (candidate: LocationCandidate): LocationLevel =>
  candidate.grandparent_id ? 'region' : candidate.parent_id ? 'city' : 'province';

const LEVEL_KEY: Record<LocationLevel, LocationKey> = {
  province: 'provinces',
  city: 'cities',
  region: 'regions',
};

const LEVEL_DEPTH: Record<LocationLevel, number> = { province: 1, city: 2, region: 3 };

const overlaps = (left: LocationCandidate, right: LocationCandidate): boolean =>
  left.start <= right.end && right.start <= left.end;

const isAncestorOf = (ancestor: LocationCandidate, child: LocationCandidate): boolean =>
  ancestor.id === child.parent_id || ancestor.id === child.grandparent_id;

export const resolveLocation = (candidates: LocationCandidate[]): ResolvedLocation | null => {
  if (candidates.length === 0) return null;
  const hasTypedAncestor = (candidate: LocationCandidate): boolean =>
    candidates.some((other) => !overlaps(other, candidate) && isAncestorOf(other, candidate));
  const ranked = [...candidates].sort(
    (left, right) =>
      right.end - right.start - (left.end - left.start) ||
      Number(hasTypedAncestor(right)) - Number(hasTypedAncestor(left)) ||
      LEVEL_DEPTH[levelOf(right)] - LEVEL_DEPTH[levelOf(left)] ||
      left.start - right.start ||
      left.id - right.id,
  );

  const primary = ranked[0];
  const level = levelOf(primary);
  const key = LEVEL_KEY[level];
  const picked: LocationCandidate[] = [primary];
  const ancestors: LocationCandidate[] = [];
  for (const candidate of ranked.slice(1)) {
    const taken = [...picked, ...ancestors];
    if (taken.some((entry) => overlaps(entry, candidate))) continue;
    if (isAncestorOf(candidate, primary)) ancestors.push(candidate);
    else if (levelOf(candidate) === level && !picked.some((entry) => entry.id === candidate.id))
      picked.push(candidate);
  }

  const consumed = [...picked, ...ancestors].flatMap((candidate) =>
    Array.from({ length: candidate.end - candidate.start + 1 }, (_, offset) => candidate.start + offset),
  );

  const order: MatchedEntry[] = [{ key, position: primary.start }];
  for (const ancestor of ancestors)
    order.push({ key: LEVEL_KEY[levelOf(ancestor)], position: ancestor.start });

  return {
    key,
    ids: picked.map((candidate) => candidate.id),
    parentCityId: level === 'region' ? primary.parent_id : null,
    consumed,
    order,
  };
};

export const matchOptions = (
  tokens: SearchToken[],
  consumed: ReadonlySet<number>,
  options: SearchableOption[],
): OptionMatch[] => {
  const taken = new Set(consumed);
  const isFree = (token: SearchToken): boolean =>
    !token.stopword && token.sources.every((source) => !taken.has(source));
  const matches: OptionMatch[] = [];

  for (const group of SEARCHABLE_OPTION_GROUPS) {
    const free = tokens.filter(isFree);
    const byWord = new Map<string, SearchToken[]>();
    for (const token of free) byWord.set(token.word, [...(byWord.get(token.word) ?? []), token]);

    const isStrict = STRICT_OPTION_GROUPS.has(group);
    let hits = options
      .filter((option) => option.group === group)
      .map((option) => {
        const titleWords = tokenizeSearchText(option.title);
        const matched = titleWords.filter((word) => byWord.has(word));
        const distinctive = matched.filter((word) => !GENERIC_OPTION_WORDS.has(word));
        const isMatch = isStrict
          ? titleWords.length > 0 && matched.length === titleWords.length
          : distinctive.length > 0;
        return isMatch ? { option, words: isStrict ? matched : distinctive } : null;
      })
      .filter((hit): hit is { option: SearchableOption; words: string[] } => !!hit);

    if (group === PropertyOptionGroup.PROPERTY_TYPE)
      hits = hits.sort((left, right) => right.option.title.length - left.option.title.length).slice(0, 1);
    if (hits.length === 0) continue;

    const usedTokens = hits.flatMap((hit) => hit.words.flatMap((word) => byWord.get(word) ?? []));
    for (const token of usedTokens) token.sources.forEach((source) => taken.add(source));

    matches.push({
      key: group.toLowerCase(),
      ids: [...new Set(hits.map((hit) => hit.option.id))],
      positions: [...new Set(usedTokens.flatMap((token) => token.sources))].sort((a, b) => a - b),
      words: [...new Set(usedTokens.filter((token) => !token.virtual).map((token) => token.word))],
    });
  }

  return matches;
};

export const residualWords = (
  tokens: SearchToken[],
  consumed: ReadonlySet<number>,
): { word: string; position: number }[] =>
  originals(tokens)
    .filter((token) => !token.stopword && !consumed.has(token.position))
    .map(({ word, position }) => ({ word, position }));

export const buildMatchedOrder = (entries: MatchedEntry[]): string[] => {
  const ordered = [...entries].sort((left, right) => left.position - right.position);
  return [...new Set(ordered.map((entry) => entry.key))];
};
