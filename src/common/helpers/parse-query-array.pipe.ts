export const parseQueryNumberArray = (query: string): number[] => {
  if (!query) return [];
  const text = query.replace(/[^0-9,]/g, ''); // remove all non-number and non-comma characters
  const q = text
    .split(',')
    .map(Number)
    .filter((e) => e);
  return q;
};

export const parseQueryStringArray = (query: string): string[] => {
  if (!query) return [];
  const text = query.replace(/[^a-zA-Z0-9,]/g, ''); // remove all non-number and non-comma characters
  const q = text.split(',');
  return q;
};
