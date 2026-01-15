import api from './api'
import { ApiResponse, Region } from '../types'

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
