export interface CardValidationResult {
  valid: boolean;
  cardType: string | null;
  sanitizedNumber: string;
  digitCount: number;
  message: string;
}
