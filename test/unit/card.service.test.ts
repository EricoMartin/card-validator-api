import { isValidLuhn} from "../../src/utils/luhn";
import { detectCardType} from "../../src/utils/detect";
import { validateCard } from "../../src/services/card.service";

/**
 * Unit tests for the card service layer.
 *
 * These tests are isolated from Express — no HTTP involved.
 * That's the point: if the Luhn logic is wrong, we want to know
 * exactly where it broke, not guess across the request lifecycle.
 */

describe("isValidLuhn()", () => {
  describe("valid card numbers (real test vectors from ISO 7812)", () => {
    const validNumbers = [
      "4111111111111111", // Visa test card
      "5500005555555559", // Mastercard test card
      "371449635398431",  // Amex test card
      "6011111111111117", // Discover test card
      "3530111333300000", // JCB test card
      "38520000023237",   // Diners Club test card
    ];

    it.each(validNumbers)("passes for %s", (number) => {
      expect(isValidLuhn(number)).toBe(true);
    });
  });

  describe("invalid card numbers", () => {
    const invalidNumbers = [
      "4111111111111112", // Off by one on check digit
      "1234567890123456", // Random digits
      "0000000000000000", // All zeros (sum is 0, but that's divisible by 10 — wait, actually valid Luhn)
      "4111111111111110", // Visa prefix but wrong check digit
    ];

    it("fails for a number with a wrong check digit", () => {
      expect(isValidLuhn("4111111111111110")).toBe(false);
    });

    it("fails for a random number", () => {
      expect(isValidLuhn("1234567890123456")).toBe(false);
    });
    console.log(invalidNumbers[0]);
  });

  it("correctly handles single digit 0 (edge: trivially passes Luhn)", () => {
    // This illustrates why we have a separate length guard — Luhn alone isn't enough.
    expect(isValidLuhn("0")).toBe(true);
  });
});

describe("detectCardType()", () => {
  it("detects Visa (13-digit)", () => expect(detectCardType("4111111111111")).toBe("Visa"));
  it("detects Visa (16-digit)", () => expect(detectCardType("4111111111111111")).toBe("Visa"));
  it("detects Mastercard", () => expect(detectCardType("5500005555555559")).toBe("Mastercard"));
  it("detects American Express", () => expect(detectCardType("371449635398431")).toBe("American Express"));
  it("detects Discover", () => expect(detectCardType("6011111111111117")).toBe("Discover"));
  it("returns null for an unrecognised prefix", () => expect(detectCardType("9999999999999999")).toBeNull());
});

describe("validateCard()", () => {
  describe("valid inputs", () => {
    it("returns valid: true for a known-good Visa number", () => {
      const result = validateCard("4111111111111111");
      expect(result.valid).toBe(true);
      expect(result.cardType).toBe("Visa");
      expect(result.digitCount).toBe(16);
    });

    it("strips spaces before validating", () => {
      const result = validateCard("4111 1111 1111 1111");
      expect(result.valid).toBe(true);
      expect(result.sanitizedNumber).toBe("4111111111111111");
    });

    it("strips dashes before validating", () => {
      const result = validateCard("4111-1111-1111-1111");
      expect(result.valid).toBe(true);
    });

    it("returns valid: false (not an error) for a number that fails Luhn", () => {
      const result = validateCard("4111111111111112");
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/Luhn/i);
    });
  });

  describe("bad input", () => {
    it("rejects a number with non-digit characters", () => {
      const result = validateCard("411abc1111111111");
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/only digits/i);
    });

    it("rejects a number that is too short (< 12 digits)", () => {
      const result = validateCard("41111111111");
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/12/);
    });

    it("rejects a number that is too long (> 19 digits)", () => {
      const result = validateCard("41111111111111111111");
      expect(result.valid).toBe(false);
      expect(result.message).toMatch(/19/);
    });

    it("rejects an empty string after stripping", () => {
      const result = validateCard("   ");
      expect(result.valid).toBe(false);
    });
  });
});

