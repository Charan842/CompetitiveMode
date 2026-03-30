import api from './api';

export const sendMessage = (matchId, message) =>
  api.post('/chat/send', { matchId, message });

export const getMessages = (matchId) =>
  api.get(`/chat/${matchId}`);
