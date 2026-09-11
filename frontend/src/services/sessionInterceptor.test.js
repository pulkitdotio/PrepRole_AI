import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { installSessionInterceptor } from './sessionInterceptor.js';

function setup(adapter) {
  const client = axios.create({ adapter });
  let version = 0;
  let expired = 0;
  const dispose = installSessionInterceptor(client, {
    getVersion: () => version,
    onUnauthorized: () => { expired += 1; version += 1; },
  });
  return { client, dispose, count: () => expired, newSession: () => { version += 1; } };
}

test('protected 401 clears session and preserves rejection for caller', async () => {
  const auth = setup(config => Promise.reject({
    config,
    response: { status: 401, data: { error: { code: 'AUTHENTICATION_REQUIRED' } } },
  }));
  await assert.rejects(auth.client.get('/interview/'));
  assert.equal(auth.count(), 1);
  auth.dispose();
  await assert.rejects(auth.client.get('/interview/'));
  assert.equal(auth.count(), 1);
});

test('expected credential errors and non-auth failures do not invoke expiration', async () => {
  let status = 401;
  let code = 'INVALID_CREDENTIALS';
  const auth = setup(config => Promise.reject({
    config,
    response: { status, data: { error: { code } } },
  }));
  for (const path of ['/auth/login', '/auth/register', '/auth/get-me', '/auth/logout', '/public']) {
    await assert.rejects(auth.client.get(path));
  }
  await assert.rejects(auth.client.delete('/auth/account'));
  status = 503;
  code = 'AUTHENTICATION_UNAVAILABLE';
  await assert.rejects(auth.client.get('/interview/'));
  assert.equal(auth.count(), 0);
  auth.dispose();
});

test('authentication-required response clears session for every protected endpoint', async () => {
  const auth = setup(config => Promise.reject({
    config,
    response: { status: 401, data: { error: { code: 'AUTHENTICATION_REQUIRED' } } },
  }));
  await assert.rejects(auth.client.delete('/auth/account'));
  assert.equal(auth.count(), 1);
  auth.dispose();
});

test('a late 401 from a prior session cannot log out a newer session', async () => {
  let rejectRequest;
  let started;
  const ready = new Promise(resolve => { started = resolve; });
  const auth = setup(config => new Promise((resolve, reject) => {
    rejectRequest = () => reject({
      config,
      response: { status: 401, data: { error: { code: 'AUTHENTICATION_REQUIRED' } } },
    });
    started();
  }));
  const request = auth.client.get('/interview/report/123');
  const rejected = assert.rejects(request);
  await ready;
  auth.newSession();
  rejectRequest();
  await rejected;
  assert.equal(auth.count(), 0);
  auth.dispose();
});
