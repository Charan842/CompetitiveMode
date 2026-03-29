import api from './api';

export const computeResult = (taskId) => api.post(`/results/compute/${taskId}`);
export const getResultByTask = (taskId) => api.get(`/results/task/${taskId}`);
export const getResultsByMatch = (matchId) => api.get(`/results/match/${matchId}`);
