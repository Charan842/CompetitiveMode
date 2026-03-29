import api from './api';

export const createSubmission = (data) => api.post('/submissions', data);
export const getSubmissionsByTask = (taskId) => api.get(`/submissions/task/${taskId}`);
export const getMySubmissions = (taskId) => api.get(`/submissions/my/${taskId}`);
export const getTrackingByTask = (taskId) => api.get(`/submissions/tracking/${taskId}`);
export const lockSubmissions = (taskId) => api.patch(`/submissions/lock/${taskId}`);
