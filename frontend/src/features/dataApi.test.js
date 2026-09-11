import assert from 'node:assert/strict';
import test from 'node:test';
import api from '../services/api.js';
import { deleteCurrentAccount } from './auth/auth.api.js';
import { getDashboardStats, getRecentInterviews } from './dashboard/dashboard.api.js';
import { deleteInterviewReport, getInterviewReports } from './interview/interview.api.js';

test('data APIs send pagination, statistics and destructive requests to intended endpoints', async t => {
  const requests = [];
  const originalAdapter = api.defaults.adapter;
  api.defaults.adapter = async config => {
    requests.push({ url: config.url, method: config.method, params: config.params, data: config.data });
    return { data: {}, status: 200, statusText: 'OK', headers: {}, config };
  };
  t.after(() => { api.defaults.adapter = originalAdapter; });

  await getInterviewReports({ page: 3, limit: 10 });
  await getDashboardStats();
  await getRecentInterviews();
  await deleteInterviewReport('507f1f77bcf86cd799439013');
  await deleteCurrentAccount(' password ');

  assert.deepEqual(requests, [
    { url: '/interview/', method: 'get', params: { page: 3, limit: 10 }, data: undefined },
    { url: '/interview/stats', method: 'get', params: undefined, data: undefined },
    { url: '/interview/', method: 'get', params: { page: 1, limit: 5 }, data: undefined },
    { url: '/interview/report/507f1f77bcf86cd799439013', method: 'delete', params: undefined, data: undefined },
    { url: '/auth/account', method: 'delete', params: undefined, data: JSON.stringify({ password: ' password ' }) }
  ]);
});
