import api from './api'
import type { Ecole } from '../types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export const ecoleService = {
  getAll: async (): Promise<ApiResponse<Ecole[]>> => {
    const response = await api.get<ApiResponse<Ecole[]>>('/ecoles')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Ecole>> => {
    const response = await api.get<ApiResponse<Ecole>>(`/ecoles/${id}`)
    return response.data
  },

  create: async (formData: FormData): Promise<ApiResponse<Ecole>> => {
    const response = await api.post<ApiResponse<Ecole>>('/ecoles', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  update: async (id: number, formData: FormData): Promise<ApiResponse<Ecole>> => {
    const response = await api.post<ApiResponse<Ecole>>(`/ecoles/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/ecoles/${id}`)
    return response.data
  },
}
