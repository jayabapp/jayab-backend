export const maskedUserMobile = (mobile: string): string => {
  return mobile
    ? mobile
        .split('')
        .map((char, i) => {
          if (i > 6 && i <= 8) return 'x';
          return char;
        })
        .join('')
    : '';
};
