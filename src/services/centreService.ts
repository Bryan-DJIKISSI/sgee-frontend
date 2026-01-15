import api from './api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface Centre {
  id_centre: number
  nom_centre: string
  lieu_centre: string
  adresse?: string
  ville?: string
  region?: string
  latitude?: string
  longitude?: string
  capacite?: number
}

export const centreService = {
  // Centres de dépôt
  getDepots: async (region?: string): Promise<ApiResponse<Centre[]>> => {
    const url = region ? `/centre-depots?region=${region}` : '/centre-depots'
    const response = await api.get<ApiResponse<Centre[]>>(url)
    return response.data
  },

  createDepot: async (data: any): Promise<ApiResponse<Centre>> => {
    const response = await api.post<ApiResponse<Centre>>('/centre-depots', data)
    return response.data
  },

  updateDepot: async (id: number, data: any): Promise<ApiResponse<Centre>> => {
    const response = await api.put<ApiResponse<Centre>>(`/centre-depots/${id}`, data)
    return response.data
  },

  deleteDepot: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/centre-depots/${id}`)
    return response.data
  },

  // Centres d'examen
  getExams: async (region?: string): Promise<ApiResponse<Centre[]>> => {
    const url = region ? `/centre-exams?region=${region}` : '/centre-exams'
    const response = await api.get<ApiResponse<Centre[]>>(url)
    return response.data
  },

  createExam: async (data: any): Promise<ApiResponse<Centre>> => {
    const response = await api.post<ApiResponse<Centre>>('/centre-exams', data)
    return response.data
  },

  updateExam: async (id: number, data: any): Promise<ApiResponse<Centre>> => {
    const response = await api.put<ApiResponse<Centre>>(`/centre-exams/${id}`, data)
    return response.data
  },

  deleteExam: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/centre-exams/${id}`)
    return response.data
  },
}
