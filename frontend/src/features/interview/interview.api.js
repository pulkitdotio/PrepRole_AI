import api from '../../services/api';

/**
 * Generate a new interview report.
 *
 * Backend expects multipart/form-data:
 *
 * resume
 * selfDescription
 * jobDescription
 */
export async function generateInterviewReport({
  resume,
  selfDescription,
  jobDescription,
}) {
  const formData = new FormData();

  formData.append('resume', resume);
  formData.append(
    'selfDescription',
    selfDescription
  );
  formData.append(
    'jobDescription',
    jobDescription
  );

  const response = await api.post(
    '/interview/',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
}

/**
 * Get one page of report summaries belonging to the authenticated user.
 */
export async function getInterviewReports({ page = 1, limit = 10 } = {}) {
  const response = await api.get(
    '/interview/',
    { params: { page, limit } }
  );

  return response.data;
}

/**
 * Get a single interview report.
 */
export async function getInterviewReport(
  interviewId
) {
  const response = await api.get(
    `/interview/report/${interviewId}`
  );

  return response.data;
}

export async function deleteInterviewReport(interviewId) {
  const response = await api.delete(`/interview/report/${interviewId}`);
  return response.data;
}
