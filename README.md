# Card Number Validation API

A REST API that validates payment card numbers using the Luhn algorithm, built with Express.js and TypeScript.

## Features

- **Card Validation**: Validates card numbers and identifies card types (Visa, MasterCard, etc.).
- **Structured Responses**: Always returns a JSON response with a `success` field for easy client handling.
- **Error Handling**: Gracefully handles invalid input without conflating it with validation results.

## Setup and Running

1. Clone the repository:

```bash
git clone <repository-url>
```

2. Install dependencies:

```bash
npm install
```

3. Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## Testing

To run tests, use:

```bash
npm test
```

## Building for Production

```bash
npm run build   # compiles TypeScript to dist/
npm start       # runs the compiled output
```

## Endpoints

### POST `/api/v1/cards/validate`

Validates a card number.

#### Request Body

```json
{
  "cardNumber": "4111 1111 1111 1111"
}
```

- `cardNumber` must be a non-empty string.
- Spaces and dashes are accepted as separators (e.g. `"4111-1111-1111-1111"`).

#### Response — valid card

```json
{
  "success": true,
  "data": {
    "valid": true,
    "cardType": "Visa",
    "digitCount": 16,
    "message": "Card number is valid."
  }
}
```

- `success`: Indicates if the request was processed successfully (true) or if there was an error (false).
- `valid`: Indicates if the card number is valid according to the Luhn algorithm.
- `cardType`: The type of card (e.g., "Visa", "MasterCard") or null if invalid.
- `digitCount`: The number of digits in the card number.
- `message`: A descriptive message about the validation result.
  **Response — invalid card (Luhn failure)**

```json
{
  "success": true,
  "data": {
    "valid": false,
    "cardType": null,
    "digitCount": 16,
    "message": "Card number failed the Luhn checksum. This number could not have been issued by a card network."
  }
}
```

**Response — bad request**

```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELD",
    "message": "Request body must include a 'cardNumber' field."
  }
}
```

### `GET /api/v1/health`

Returns `{ "status": "ok", "timestamp": "..." }`.  Used for uptime monitoring.

**HTTP Status Codes**

| Status | Meaning                                                                |
| ------ | ---------------------------------------------------------------------- |
| `200`  | Request was well-formed. Check `data.valid` for the validation result. |
| `400`  | Malformed request (missing or wrong-type `cardNumber`).                |
| `404`  | Unknown endpoint.                                                      |
| `500`  | Unexpected server error.                                               |

---

## Design Decisions

### Why Express over NestJS?

The task is a single endpoint. NestJS adds significant scaffolding (modules, decorators, DI container) that is valuable at scale but is unnecessary overhead for this scope. Express keeps the project lean, fast to set up, and easy to reason about line-by-line — which matters for a live review.

### Why POST (not GET)?

Card numbers are sensitive data. Sending them in a GET query string would expose them in server logs, browser history, and any proxy in between. POST keeps them in the request body.

### Why is a valid-but-failing card still a `200`?

A `400` means the _request_ was bad — the client did something wrong. A card failing the Luhn check is a _result_, not a client error. Returning `200` with `valid: false` lets clients reliably distinguish "you sent us garbage" (400) from "we processed your input and here's the answer" (200).

### Validation logic

A card number is considered **valid** when all three conditions hold:

1. After stripping spaces and dashes, the remaining characters are all digits.
2. The digit count falls within the ISO/IEC 7812 range (12–19 digits).
3. The digit string passes the **Luhn checksum** (mod-10 algorithm).

Card _type_ detection is informational. An unrecognised network prefix does not make a card invalid — new BIN ranges are issued regularly.

### Why is `card.service.ts` separate from `card.controller.ts`?

The service contains pure business logic with no HTTP dependencies. The controller handles only HTTP concerns (parsing the request, choosing status codes, shaping the response). This separation means:

- The Luhn algorithm and card type detection can be unit-tested without spinning up an Express app.
- Either layer can be replaced independently (e.g. swap Express for Fastify, or swap Luhn for a third-party card vault).

### `app.ts` vs `server.ts`

`app.ts` returns a configured Express instance without binding a port. `server.ts` imports it and calls `.listen()`. This pattern lets integration tests import `app` and pass it to `supertest` without conflicting port bindings.

### Strict TypeScript

`strict: true` is enabled in `tsconfig.json`. All types are explicit — no `any` in production code. The `cardNumber` field is accepted as `unknown` in the controller so that TypeScript forces us to narrow the type before using it.

---

## Project Structure

```src/
├── app.ts                # Express app setup
├── server.ts             # Starts the server
├── controllers/
│   └── card.controller.ts # HTTP request handling for card validation
├── services/
│   └── card.service.ts    # Business logic for card validation and type detection
├── routes/
│   └── card.routes.ts     # Express routes for card endpoints
├── types/
│   └── card.types.ts      # TypeScript types for card validation responses
├── middlewares/
│   └── error.middleware.ts # Global error handling middleware
├── tests/
│   ├── unit/
│   │   └── card.service.test.ts # Unit tests for card validation logic
│   └── integration/
│       └── card.controller.test.ts # Integration tests for the API endpoints
├── package.json
├── tsconfig.json
└── README.md
```

## Test Cards (for manual testing)

| Network          | Number              | Valid? |
| ---------------- | ------------------- | ------ |
| Visa             | 4111 1111 1111 1111 | ✅     |
| Mastercard       | 5500 0055 5555 5559 | ✅     |
| American Express | 3714 496353 98431   | ✅     |
| Discover         | 6011 1111 1111 1117 | ✅     |
| Invalid (Luhn)   | 4111 1111 1111 1112 | ❌     |
