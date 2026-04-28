import request from 'supertest';
import app from '../../src/app';

/**
 * Integration tests for the POST /api/v1/cards/validate endpoint.
 *
 * These tests exercise the full Express stack — routing, middleware,
 * controller, and service — through real HTTP calls, but without
 * binding to a port (supertest handles that internally).
 */

describe('POST /api/v1/cards/validate', () => {
  describe('happy path', () => {
    it('returns 200 and valid:true for a good Visa card', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4111111111111111' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(true);
      expect(res.body.data.cardType).toBe('Visa');
    });

    it('returns 200 and valid:false for a number that fails Luhn', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4111111111111112' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.valid).toBe(false);
    });

    it('accepts card numbers with spaces', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4111 1111 1111 1111' });

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(true);
    });

    it('accepts card numbers with dashes', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4111-1111-1111-1111' });

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(true);
    });
  });

  describe('bad requests — 400 errors', () => {
    it('returns 400 when cardNumber field is missing', async () => {
      const res = await request(app).post('/api/v1/cards/validate').send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('MISSING_FIELD');
    });

    it('returns 400 when cardNumber is a number (not a string)', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: 4111111111111111 });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_TYPE');
    });

    it('returns 400 when cardNumber is an empty string', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('INVALID_TYPE');
    });

    it('returns 400 when body is missing entirely', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .set('Content-Type', 'application/json')
        .send();

      expect(res.status).toBe(400);
    });

    it('returns 400 when cardNumber is null', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: null });

      expect(res.status).toBe(400);
    });
  });

  describe('edge cases still handled gracefully', () => {
    it('handles letters in card number with a valid response (not a 500)', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '4111abcd11111111' });

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(false);
    });

    it('handles very long number gracefully', async () => {
      const res = await request(app)
        .post('/api/v1/cards/validate')
        .send({ cardNumber: '1'.repeat(30) });

      expect(res.status).toBe(200);
      expect(res.body.data.valid).toBe(false);
    });
  });

  describe('other endpoints', () => {
    it('GET /health returns 200', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('OK');
    });

    it('unknown routes return 404', async () => {
      const res = await request(app).get('/unknown');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });
});
