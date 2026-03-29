import api from './api';

export const createMatch = (opponentId) => api.post('/matches', { opponentId });
export const getMyMatches = () => api.get('/matches');
export const getMatch = (id) => api.get(`/matches/${id}`);
export const toggleTurn = (id) => api.patch(`/matches/${id}/toggle-turn`);
export const searchUsers = (q) => api.get(`/matches/search-users?q=${q}`);
export const getMatchStats = (id) => api.get(`/matches/${id}/stats`);
export const setConstraint = (id, constraint) => api.patch(`/matches/${id}/constraint`, { constraint });
export const getActivityHeatmap = (id) => api.get(`/matches/${id}/activity`);
export const disposeMatch = (id) => api.delete(`/matches/${id}`);
