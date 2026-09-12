export function getApiErrorMessage(error, fallback) {
  const serverMessage = error?.response?.data?.message;
  if (typeof serverMessage === 'string' && serverMessage.trim()) return serverMessage;
  if (error?.response?.status === 429) return "You've reached the current generation limit. Please try again later.";
  if (error?.isAxiosError && !error.response) return 'Unable to connect to PrepRole AI. Check your connection and try again.';
  return fallback;
}

export function isCanceledRequest(error) {
  return error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError';
}
