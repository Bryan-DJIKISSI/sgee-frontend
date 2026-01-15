import api from './api'
import { ApiResponse, Enrollement } from '../types'

export const enrollmentService = {
  getMyEnrollments: async (): Promise<ApiResponse<Enrollement[]>> => {
    const response = await api.get<ApiResponse<Enrollement[]>>('/enrollements/my-enrollements')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Enrollement>> => {
    const response = await api.get<ApiResponse<Enrollement>>(`/enrollements/${id}`)
    return response.data
  },

  create: async (formData: FormData): Promise<ApiResponse<Enrollement>> => {
    const response = await api.post<ApiResponse<Enrollement>>('/enrollements', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  // Admin only
  getAll: async (): Promise<ApiResponse<Enrollement[]>> => {
    const response = await api.get<ApiResponse<Enrollement[]>>('/enrollements')
    return response.data
  },

  validatePayment: async (id: number): Promise<ApiResponse<Enrollement>> => {
    const response = await api.put<ApiResponse<Enrollement>>(`/enrollements/${id}/validate`)
    return response.data
  },

  reject: async (id: number, reason: string): Promise<ApiResponse<Enrollement>> => {
    const response = await api.put<ApiResponse<Enrollement>>(`/enrollements/${id}/reject`, { reason })
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/enrollements/${id}`)
    return response.data
  },
}
