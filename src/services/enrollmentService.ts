import api from './api'
import type { Enrollement } from '../types'

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

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
    const response = await api.get<ApiResponse<Enrollement[]>>('/enrollements?per_page=all')
    return response.data
  },

  validate: async (id: number): Promise<ApiResponse<Enrollement>> => {
    const response = await api.put<ApiResponse<Enrollement>>(`/enrollements/${id}/validate`)
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

  downloadFiche: async (id: number): Promise<void> => {
    const response = await api.get(`/enrollements/${id}/download-fiche`, {
      responseType: 'blob',
    })

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Extraire le nom du fichier depuis les headers si disponible
    const contentDisposition = response.headers['content-disposition']
    let fileName = `Fiche_Inscription_${id}.pdf`
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1]
      }
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },

  downloadReceipt: async (id: number): Promise<void> => {
    const response = await api.get(`/enrollements/${id}/download-receipt`, {
      responseType: 'blob',
    })

    // Créer un lien de téléchargement
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    
    // Extraire le nom du fichier depuis les headers si disponible
    const contentDisposition = response.headers['content-disposition']
    let fileName = `Recu_Inscription_${id}.pdf`
    
    if (contentDisposition) {
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/)
      if (fileNameMatch && fileNameMatch[1]) {
        fileName = fileNameMatch[1]
      }
    }
    
    link.setAttribute('download', fileName)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
  },
}
