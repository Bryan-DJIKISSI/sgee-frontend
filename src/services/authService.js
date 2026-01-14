import api from './api'

export const authService = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response.data
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  verifyEmail: async (email, code) => {
    const response = await api.post('/auth/verify-email', { email, code })
    return response.data
  },

  resendCode: async (email) => {
    const response = await api.post('/auth/resend-code', { email })
    return response.data
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile')
    return response.data
  },
}
