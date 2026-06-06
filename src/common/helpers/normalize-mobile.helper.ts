import { BadRequestException } from '@nestjs/common';

export default function normalizeMobileNumber(phone: string): string | null {
  // Remove any non-digit characters (spaces, dashes, parentheses, etc.)
  let cleaned = phone.replace(/\D/g, '');

  // Remove leading zeros that might be more than one (e.g., 0009123456789)
  cleaned = cleaned.replace(/^0+/, '');

  // Check if it starts with 98 (Iran country code without +)
  if (cleaned.startsWith('98')) {
    cleaned = cleaned.substring(2);
  }

  // Now we should have a 9 or 10 digit number (starting with 9 or not)
  // Valid Iranian mobile numbers are 10 digits after country code: 9XXXXXXXXX
  if (cleaned.length === 9) {
    // If 9 digits, assume missing leading 0
    cleaned = '0' + cleaned;
  } else if (cleaned.length === 10 && cleaned.startsWith('9')) {
    // If 10 digits starting with 9, add leading 0
    cleaned = '0' + cleaned;
  } else if (cleaned.length === 11 && cleaned.startsWith('09')) {
    // Already in correct format
    // Do nothing
  } else {
    // Invalid format
    throw new BadRequestException('شماره موبایل صحیح نیست');
  }

  return cleaned;
}
