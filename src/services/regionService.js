import api from './api'

export const regionService = {
  getAll: async () => {
    const response = await api.get('/regions')
    return response.data
  },

  getDepartementsByRegion: async (regionCode) => {
    const response = await api.get(`/regions/${regionCode}/departements`)
    return response.data
  },
}
