/**
 * قیمت رند به ده هزار میشه
 * رند رو به پایین
 * @param price
 * @param force برای اینکه هزینه نظافت و نفر اضافه زیر صد هزار و غیر رند نباشه
 * @param commission
 * @returns
 */
export const normalizePropertyPrice = (price: number, force = false): number => {
  const roundingDegree = 100000;
  if (!price) return 0;
  if (price < roundingDegree && !force) return price;

  const n = Math.floor(price / roundingDegree) * roundingDegree;

  return n;
};

export const calculateAdvisorCommisssion = (
  price: number,
  commission: number,
): { advisorCommissionAmount: number; rentFinalPrice: number } => {
  const advisorCommissionAmount = price * (commission / 100);
  const rentFinalPrice = price - advisorCommissionAmount;
  // console.log({ price, commission, advisorCommissionAmount, rentFinalPrice });

  return { advisorCommissionAmount, rentFinalPrice };
};
