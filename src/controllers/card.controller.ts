import { Request, Response } from 'express';
import { validateCard } from '../services/card.service';
import type { ValidateCardResponse } from '../types/card.types';

/**
 * POST /api/v1/cards/validate
 *
 * Accepts a card number and returns a structured validation result.
 *
 * Design decisions:
 * - POST (not GET) because card numbers are sensitive; they must never
 *   appear in URLs, server logs, or browser history.
 * - Versioned route (/v1/) so future breaking changes get a new version
 *   rather than silently breaking existing consumers.
 * - The response always has `success: boolean` at the top level so clients
 *   can branch on a single field without inspecting HTTP status codes alone.
 */
export const validateCardEndpoint = (req: Request, res: Response): void => {
  const body = req.body as Record<string, unknown>;

  // Guard: body must exist and contain cardNumber
  if (!body || !('cardNumber' in body)) {
    const response: ValidateCardResponse = {
      success: false,
      error: {
        code: 'MISSING_FIELD',
        message: "Request body must include a 'cardNumber' field.",
      },
    };
    res.status(400).json(response);
    return;
  }

  const { cardNumber } = body;

  // Guard: cardNumber must be a non-empty string
  if (typeof cardNumber !== 'string' || cardNumber.trim() === '') {
    const response: ValidateCardResponse = {
      success: false,
      error: {
        code: 'INVALID_TYPE',
        message: "'cardNumber' must be a non-empty string.",
      },
    };
    res.status(400).json(response);
    return;
  }

  const result = validateCard(cardNumber);

  const response: ValidateCardResponse = {
    success: true,
    data: {
      valid: result.valid,
      cardType: result.cardType,
      digitCount: result.digitCount,
      message: result.message,
    },
  };

  // 200 even for invalid cards — the request itself was well-formed.
  // A 400 here would conflate "bad request" with "card failed validation",
  // making it harder for clients to distinguish input errors from results.
  res.status(200).json(response);
};
