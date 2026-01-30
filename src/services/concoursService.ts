import api from './api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface Concours {
  id_concours: number
  intitule: string
  niveau?: string
  cycle?: string
  description?: string
  date_debut: string
  date_fin: string
  date_limite_inscription: string
  date_limite_paiement: string
  date_limite_depot: string
  id_ecole: number
  id_departement?: number
  id_filiere?: number
  ecole?: {
    id_ecole: number
    nom_ecole: string
    sigle?: string
  }
  departement?: {
    id_departement: number
    intitule: string
  }
  filiere?: {
    id_filiere: number
    intitule: string
  }
  niveau_requis: string
  frais_inscription: number
  places_disponibles: number
  statut: string
  pdf_path?: string
}

export const concoursService = {
  getAll: async (): Promise<ApiResponse<Concours[]>> => {
    const response = await api.get<ApiResponse<Concours[]>>('/concours')
    return response.data
  },

  getAvailable: async (): Promise<ApiResponse<Concours[]>> => {
    const response = await api.get<ApiResponse<Concours[]>>('/concours/available')
    return response.data
  },

  getById: async (id: number): Promise<ApiResponse<Concours>> => {
    const response = await api.get<ApiResponse<Concours>>(`/concours/${id}`)
    return response.data
  },

  create: async (data: any): Promise<ApiResponse<Concours>> => {
    const response = await api.post<ApiResponse<Concours>>('/concours', data)
    return response.data
  },

  update: async (id: number, data: any): Promise<ApiResponse<Concours>> => {
    const response = await api.put<ApiResponse<Concours>>(`/concours/${id}`, data)
    return response.data
  },

  delete: async (id: number): Promise<ApiResponse<null>> => {
    const response = await api.delete<ApiResponse<null>>(`/concours/${id}`)
    return response.data
  },
}
