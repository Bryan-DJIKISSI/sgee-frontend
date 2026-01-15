import api from './api'
import type { AuthResponse, User, RegisterFormData, LoginFormData } from '../types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export const authService = {
  register: async (userData: RegisterFormData): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', userData)
    return response.data
  },

  login: async (credentials: LoginFormData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    if (response.data.success && response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  verifyEmail: async (email: string, code: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/auth/verify-email', { email, code })
    return response.data
  },

  resendCode: async (email: string): Promise<ApiResponse<null>> => {
    const response = await api.post<ApiResponse<null>>('/auth/resend-code', { email })
    return response.data
  },

  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/profile')
    return response.data
  },
}
