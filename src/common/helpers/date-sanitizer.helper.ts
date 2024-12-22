export const dateSanitizer = (date: { year: number; month: number; day: number }): string => {
  if (!date) return '';
  const formattedMonth = date.month.toString().padStart(2, '0');
  const formattedDay = date.day.toString().padStart(2, '0');

  return `${date.year}/${formattedMonth}/${formattedDay}`;
};
