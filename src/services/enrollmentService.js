import api from './api'

export const enrollmentService = {
  getMyEnrollments: async () => {
    const response = await api.get('/enrollements/my-enrollements')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/enrollements/${id}`)
    return response.data
  },

  create: async (formData) => {
    const response = await api.post('/enrollements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Admin only
  getAll: async () => {
    const response = await api.get('/enrollements')
    return response.data
  },

  validatePayment: async (id) => {
    const response = await api.put(`/enrollements/${id}/validate`)
    return response.data
  },

  reject: async (id, reason) => {
    const response = await api.put(`/enrollements/${id}/reject`, { reason })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/enrollements/${id}`)
    return response.data
  },
}
