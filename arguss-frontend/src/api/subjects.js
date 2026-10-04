import { api } from './client.js'

export const subjectsApi = {
  create: (data) => api.post('/subjects', data).then((r) => r.data),
  listMine: () => api.get('/subjects/mine').then((r) => r.data),
  getInvite: (subjectId) => api.get(`/subjects/${subjectId}/invite`).then((r) => r.data),
  lookupInvite: (inviteCode) => api.get(`/subjects/lookup-invite/${inviteCode}`).then((r) => r.data),
  enroll: (inviteCode) => api.post('/subjects/enroll', { invite_code: inviteCode }).then((r) => r.data),
  join: (inviteCode) => api.post('/subjects/join', { invite_code: inviteCode }).then((r) => r.data),
  unenroll: (subjectId) => api.delete(`/subjects/${subjectId}/enrollment`),
  listEnrolled: () => api.get('/subjects/enrolled').then((r) => r.data),
}