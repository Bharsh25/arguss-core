import { api } from './client.js'

export const authApi = {
  teacherRegister: (data) => api.post('/auth/teacher/register', data).then((r) => r.data),
  teacherLogin: (data) => api.post('/auth/teacher/login', data).then((r) => r.data),

  identifyStudent: (photoBlob) => {
    const form = new FormData()
    form.append('photo', photoBlob, 'capture.jpg')
    return api.post('/auth/student/identify', form).then((r) => r.data)
  },

  registerStudent: (name, photoBlob, voiceBlob = null) => {
    const form = new FormData()
    form.append('name', name)
    form.append('photo', photoBlob, 'capture.jpg')
    if (voiceBlob) {
      form.append('voice', voiceBlob, 'voice.webm')
    }
    return api.post('/auth/student/register', form).then((r) => r.data)
  },
}