import { maskedUserMobile } from './masked-user-mobile.helper';

describe('maskedUserMobile', () => {
  it('should mask characters at positions 7 and 8 (indices 7 and 8)', () => {
    const mobile = '09123456789';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('0912345xx89');
  });

  it('should mask only positions 7 and 8 for a standard 11-digit mobile number', () => {
    const mobile = '09121234567';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('0912123xx67');
  });

  it('should handle mobile numbers shorter than 8 characters', () => {
    const mobile = '1234567';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('1234567');
  });

  it('should handle mobile numbers with exactly 8 characters', () => {
    const mobile = '12345678';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('1234567x');
  });

  it('should handle mobile numbers with exactly 9 characters', () => {
    const mobile = '123456789';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('1234567xx');
  });

  it('should handle mobile numbers longer than 9 characters', () => {
    const mobile = '091234567890';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('0912345xx890');
  });

  it('should handle empty string', () => {
    const mobile = '';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('');
  });

  it('should handle single character', () => {
    const mobile = '1';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('1');
  });

  it('should preserve all characters except positions 7 and 8', () => {
    const mobile = '0123456789';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('0123456xx9');
    expect(result[0]).toBe('0');
    expect(result[1]).toBe('1');
    expect(result[2]).toBe('2');
    expect(result[3]).toBe('3');
    expect(result[4]).toBe('4');
    expect(result[5]).toBe('5');
    expect(result[6]).toBe('6');
    expect(result[7]).toBe('x');
    expect(result[8]).toBe('x');
    expect(result[9]).toBe('9');
  });

  it('should handle mobile numbers with special characters', () => {
    const mobile = '0912-345-67';
    const result = maskedUserMobile(mobile);
    expect(result).toBe('0912-34xx67');
  });
});

