/**
 * Orchestrates full card validation.
 *
 * Strips whitespace/dashes first (users often copy numbers with spaces,
 * e.g. "4111 1111 1111 1111"). We validate only the digit string.
 *
 * A card is considered valid when ALL of the following hold:
 *   1. After sanitisation, it contains only digits.
 *   2. It falls within the valid length range (12–19 digits per ISO 7812).
 *   3. It passes the Luhn checksum.
 *
 * Note: Card type matching is informational — an unrecognised network
 * does not make a card invalid (new BIN ranges are issued regularly).
 */
import { isValidLuhn } from "../utils/luhn";
import { detectCardType } from "../utils/detect";
import { CardValidationResult } from "../utils/validate";

export function validateCard(rawInput: string): CardValidationResult {
  const sanitized = rawInput.replace(/[\s-]/g, "");

  // Guard: only digits after sanitisation
  if (!/^\d+$/.test(sanitized)) {
    return {
      valid: false,
      cardType: null,
      sanitizedNumber: sanitized,
      digitCount: sanitized.length,
      message: "Card number must contain only digits (spaces and dashes are allowed as separators).",
    };
  }

  const length = sanitized.length;

  // Guard: ISO 7812 length range
  if (length < 12 || length > 19) {
    return {
      valid: false,
      cardType: null,
      sanitizedNumber: sanitized,
      digitCount: length,
      message: `Card number must be between 12 and 19 digits. Received ${length}.`,
    };
  }

  const luhnPassed = isValidLuhn(sanitized);
  const cardType = detectCardType(sanitized);

  return {
    valid: luhnPassed,
    cardType,
    sanitizedNumber: sanitized,
    digitCount: length,
    message: luhnPassed
      ? "Card number is valid."
      : "Card number failed the Luhn checksum. This number could not have been issued by a card network.",
  };
}
