/**
 * Implements the Luhn algorithm (also known as the "modulus 10" algorithm).
 *
 * Think of it like a barcode check digit — the last digit of a card number
 * is a mathematical fingerprint of the rest. If any digit gets corrupted
 * (a typo, OCR error, transposition), the checksum fails.
 *
 * Steps:
 * 1. Starting from the second-to-last digit, double every other digit moving left.
 * 2. If doubling produces a number > 9, subtract 9 (equivalent to summing its digits).
 * 3. Sum all digits (the doubled/adjusted ones plus the untouched ones).
 * 4. If the total is divisible by 10, the number is valid.
 *
 * Time complexity: O(n) where n is the number of digits.
 */
export function isValidLuhn(digits: string): boolean {
  let sum = 0;
  let shouldDouble = false;

  // Iterate right to left
  for (let i = digits.length - 1; i >= 0; i--) {
    // Direct conversion: subtract ASCII '0' (48) to get digit value
    let digit = digits.charCodeAt(i) - 48;

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}
