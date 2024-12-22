export const p2e = (s: string | number): string => {
  if (!s) return "";
  return `${s}`.replace(/[۰-۹]/g, (d: string) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d)?.toString() || "0");
};
