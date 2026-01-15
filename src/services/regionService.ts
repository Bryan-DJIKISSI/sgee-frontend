import api from './api'
import type { Region } from '../types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface RegionDepartementsResponse {
  region: string
  code: string
  departements: string[]
}

export const regionService = {
  getAll: async (): Promise<ApiResponse<Region[]>> => {
    const response = await api.get<ApiResponse<Region[]>>('/regions')
    return response.data
  },

  getDepartementsByRegion: async (regionCode: string): Promise<ApiResponse<RegionDepartementsResponse>> => {
    const response = await api.get<ApiResponse<RegionDepartementsResponse>>(`/regions/${regionCode}/departements`)
    return response.data
  },
}
