import api from './api';

export const createTask = (data) => api.post('/tasks', data);
export const getTasksByMatch = (matchId) => api.get(`/tasks/match/${matchId}`);
export const getTodayTask = (matchId) => api.get(`/tasks/today/${matchId}`);
export const getTask = (id) => api.get(`/tasks/${id}`);
export const getTemplates = (category) =>
  category ? api.get(`/tasks/templates?category=${category}`) : api.get('/tasks/templates');
export const getAllSubmissions = (taskId) => api.get(`/tasks/${taskId}/all-submissions`);
export const deleteTask = (id) => api.delete(`/tasks/${id}`);
