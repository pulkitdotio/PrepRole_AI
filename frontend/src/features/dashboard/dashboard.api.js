import api from '../../services/api.js';

export async function getDashboardStats({ signal } = {}) {
  const response = await api.get('/interview/stats', { signal });

  return response.data;
}

export async function getRecentInterviews({ signal } = {}) {
  const response = await api.get('/interview/', { params: { page: 1, limit: 5 }, signal });

  return response.data;
}
