import assert from 'node:assert/strict';
import test from 'node:test';
import { getApiErrorMessage, isCanceledRequest } from './apiError.js';
import { generationMessages, nextGenerationMessage } from '../features/interview/generationStatus.js';

test('API errors preserve safe backend messages and clarify limits/network failures', () => {
  assert.equal(getApiErrorMessage({ response: { data: { message: 'Invalid request' } } }, 'Fallback'), 'Invalid request');
  assert.match(getApiErrorMessage({ response: { status: 429, data: {} } }, 'Fallback'), /generation limit/);
  assert.match(getApiErrorMessage({ isAxiosError: true }, 'Fallback'), /connect to PrepAI/);
  assert.equal(getApiErrorMessage({ response: { status: 500, data: {} } }, 'Fallback'), 'Fallback');
  assert.equal(isCanceledRequest({ code: 'ERR_CANCELED' }), true);
  assert.equal(isCanceledRequest(new Error('failure')), false);
});

test('generation status rotates without fake progress values', () => {
  assert.equal(nextGenerationMessage(generationMessages.length - 1), 0);
  assert.equal(generationMessages.some(message => /\d+%/.test(message)), false);
});
