// Clear React auth state only for protected API failures, never navigate from Axios.
export function installSessionInterceptor(client, { getVersion, onUnauthorized }) {
  const requestId = client.interceptors.request.use((config) => {
    config.sessionVersion = getVersion();
    return config;
  });
  const responseId = client.interceptors.response.use(
    response => response,
    error => {
      const config = error.config;
      const authenticationExpired =
        error.response?.status === 401 &&
        error.response?.data?.error?.code === 'AUTHENTICATION_REQUIRED';
      if (authenticationExpired &&
          config.sessionVersion === getVersion()) {
        onUnauthorized();
      }
      return Promise.reject(error);
    }
  );
  return () => {
    client.interceptors.request.eject(requestId);
    client.interceptors.response.eject(responseId);
  };
}
