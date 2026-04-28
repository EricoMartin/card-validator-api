/**
 * Shared types for the card validation endpoint.
 *
 * Keeping types in their own file makes them importable by both the
 * controller and the tests, without coupling either to the other.
 */

export interface ValidateCardRequestBody {
  cardNumber: unknown; // Accept `unknown` so the controller can validate the shape
}

export interface ValidateCardSuccessResponse {
  success: true;
  data: {
    valid: boolean;
    cardType: string | null;
    digitCount: number;
    message: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ValidateCardResponse = ValidateCardSuccessResponse | ErrorResponse;