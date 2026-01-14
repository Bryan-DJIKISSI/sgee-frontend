import api from './api'

export const ecoleService = {
  getAll: async () => {
    const response = await api.get('/ecoles')
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/ecoles/${id}`)
    return response.data
  },

  create: async (formData) => {
    const response = await api.post('/ecoles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  update: async (id, formData) => {
    const response = await api.post(`/ecoles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/ecoles/${id}`)
    return response.data
  },
}
