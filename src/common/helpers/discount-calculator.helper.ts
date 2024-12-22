export const discountCalculator = (price: number, priceWithDiscount: number): number =>
  Math.floor(((price - priceWithDiscount) / price) * 100);
