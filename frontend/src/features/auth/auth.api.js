import api from '../../services/api.js';

export async function loginUser(credentials) {
  const response = await api.post(
    '/auth/login',
    credentials
  );

  return response.data;
}

export async function registerUser(userData) {
  const response = await api.post(
    '/auth/register',
    userData
  );

  return response.data;
}

export async function logoutUser() {
  const response = await api.post('/auth/logout');

  return response.data;
}

export async function getCurrentUser({ signal } = {}) {
  const response = await api.get('/auth/get-me', { signal });

  return response.data;
}

export async function deleteCurrentAccount(password) {
  const response = await api.delete('/auth/account', { data: { password } });
  return response.data;
}
