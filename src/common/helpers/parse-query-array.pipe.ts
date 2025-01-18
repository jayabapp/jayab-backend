export const parseQueryNumberArray = (query: string): number[] => {
  const text = query.replace(/[^0-9,]/g, ''); // remove all non-number and non-comma characters
  const q = text.split(',').map(Number);
  return q;
};

export const parseQueryStringArray = (query: string): string[] => {
  const text = query.replace(/[^a-zA-Z0-9,]/g, ''); // remove all non-number and non-comma characters
  const q = text.split(',');
  return q;
};
