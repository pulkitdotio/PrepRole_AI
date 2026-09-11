import api from '../../services/api.js';

export async function decodeBlobError(error) {
  const body = error?.response?.data;
  if (!(body instanceof Blob) || !body.type.includes('json')) return error;

  try {
    error.response.data = JSON.parse(await body.text());
  } catch {
    // Preserve the original Axios error when the response is not valid JSON.
  }
  return error;
}

export async function generateResumePDF(
  interviewReportId
) {
  try {
    const response = await api.post(
      `/interview/resume/pdf/${interviewReportId}`,
      {},
      {
        responseType: 'blob',
      }
    );

    return response.data;
  } catch (error) {
    throw await decodeBlobError(error);
  }
}
