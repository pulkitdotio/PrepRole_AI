import assert from 'node:assert/strict';
import test from 'node:test';
import { getPageMetadata } from './usePageMetadata.js';

test('page metadata covers public, protected, dynamic, and unknown routes', () => {
  assert.equal(getPageMetadata('/').title, 'PrepRole AI — Prepare for the Role');
  assert.equal(getPageMetadata('/dashboard').title, 'Dashboard | PrepRole AI');
  assert.equal(getPageMetadata('/interviews/report/abc').title, 'Interview Report | PrepRole AI');
  assert.equal(getPageMetadata('/resume/abc').title, 'Tailored Resume | PrepRole AI');
  assert.equal(getPageMetadata('/missing').title, 'Page Not Found | PrepRole AI');
});
