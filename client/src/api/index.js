import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const startSession = (jobDescription) =>
  api.post('/api/interview/start', { jobDescription }).then((r) => r.data);

export const submitAnswer = (sessionId, questionId, question, answer) =>
  api.post('/api/interview/answer', { sessionId, questionId, question, answer }).then((r) => r.data);

export const getSessionSummary = (sessionId) =>
  api.get(`/api/interview/summary/${sessionId}`).then((r) => r.data);
