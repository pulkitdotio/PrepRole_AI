import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageMetadata } from './usePageMetadata.js';

test('page metadata covers public, protected, dynamic, and unknown routes', () => {
  assert.equal(getPageMetadata('/').title, 'PrepAI — Prepare Smarter');
  assert.equal(getPageMetadata('/dashboard').title, 'Dashboard | PrepAI');
  assert.equal(getPageMetadata('/interviews/report/abc').title, 'Interview Report | PrepAI');
  assert.equal(getPageMetadata('/resume/abc').title, 'Tailored Resume | PrepAI');
  assert.equal(getPageMetadata('/missing').title, 'Page Not Found | PrepAI');
});
