import assert from 'node:assert/strict';
import test from 'node:test';
import { HISTORY_PAGE_SIZE, historySearch, parseHistoryPage } from './pagination.js';

test('history pages use safe URL values and the intended page size', () => {
  assert.equal(HISTORY_PAGE_SIZE, 10);
  for (const value of [null, '', '0', '-1', '1.5', 'abc', '9007199254740992']) {
    assert.equal(parseHistoryPage(value), 1);
  }
  assert.equal(parseHistoryPage('2'), 2);
  assert.equal(historySearch(1), '');
  assert.equal(historySearch(3), '?page=3');
});
