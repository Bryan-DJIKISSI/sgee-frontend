import api from './api'

interface AdminStats {
  totalCandidats: number
  totalEcoles: number
  totalConcours: number
  concoursOuverts: number
  enrollementsTotal: number
  enrollementsEnAttente: number
  enrollementsValides: number
  enrollementsRejetes: number
}

interface CandidatStats {
  totalInscriptions: number
  enAttente: number
  valides: number
  rejetes: number
}

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export const statsService = {
  getAdminStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>('/stats/admin')
    return response.data
  },

  getCandidatStats: async (): Promise<CandidatStats> => {
    const response = await api.get<CandidatStats>('/stats/candidat')
    return response.data
  },
}
