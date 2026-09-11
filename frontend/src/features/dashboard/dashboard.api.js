import api from '../../services/api';

export async function getDashboardStats() {
  const response = await api.get('/interview/stats');

  return response.data;
}

export async function getRecentInterviews() {
  const response = await api.get('/interview/', { params: { page: 1, limit: 5 } });

  return response.data;
}
