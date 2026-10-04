import { api } from './client.js'

export const attendanceApi = {
  previewFromPhotos: (subjectId, files) => {
    const form = new FormData()
    files.forEach((file) => form.append('photos', file))
    return api.post(`/attendance/${subjectId}/photo`, form).then((r) => r.data)
  },
  previewFromVoice: (subjectId, audioBlob) => {
    const form = new FormData()
    form.append('audio', audioBlob, 'roll-call.webm')
    return api.post(`/attendance/${subjectId}/voice`, form).then((r) => r.data)
  },
  confirm: (subjectId, records) =>
    api.post(`/attendance/${subjectId}/confirm`, { records }).then((r) => r.data),
  history: (subjectId) => api.get(`/attendance/${subjectId}/history`).then((r) => r.data),
  mine: () => api.get('/attendance/me').then((r) => r.data),
}