/**
 * Card network detection patterns.
 *
 * Patterns sourced from ISO/IEC 7812 and network-published BIN ranges.
 * Order matters — more specific patterns (e.g. Amex) must come before
 * broader catches so we don't misclassify.
 */
const CARD_PATTERNS: Record<string, RegExp> = {
  Visa: /^4\d{12}(?:\d{3})?(?:\d{3})?$/,
  Mastercard: /^5[1-5]\d{14}$|^2(?:2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)\d{12}$/,
  'American Express': /^3[47]\d{13}$/,
  Discover: /^6(?:011|5\d{2})\d{12}(?:\d{3})?$/,
  'Diners Club': /^3(?:0[0-5]|[68]\d)\d{11}$/,
  JCB: /^(?:2131|1800|35\d{3})\d{11}$/,
  UnionPay: /^62\d{14,17}$/,
  Maestro: /^(?:5018|5020|5038|6304|6759|676[1-3])\d{8,15}$/,
};

/**
 * Detects the card network from the card number.
 * Returns null if the number doesn't match any known network pattern.
 */
export function detectCardType(digits: string): string | null {
  for (const [network, pattern] of Object.entries(CARD_PATTERNS)) {
    if (pattern.test(digits)) return network;
  }
  return null;
}
