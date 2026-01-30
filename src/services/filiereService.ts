import api from './api';

export interface Filiere {
  id_filiere: number;
  intitule: string;
  code_filiere: string;
  niveau: string;
  duree_ans: number;
  description?: string;
  id_departement: number;
  created_at?: string;
  updated_at?: string;
}

export const filiereService = {
  // Récupérer toutes les filières
  getAll: async (): Promise<Filiere[]> => {
    const response = await api.get('/filieres');
    return response.data;
  },

  // Récupérer une filière par ID
  getById: async (id: number): Promise<Filiere> => {
    const response = await api.get(`/filieres/${id}`);
    return response.data;
  },

  // Récupérer les filières d'un département
  getByDepartement: async (departementId: number): Promise<Filiere[]> => {
    const response = await api.get(`/departements/${departementId}/filieres`);
    return response.data;
  },

  // Récupérer les filières d'une école
  getByEcole: async (ecoleId: number): Promise<Filiere[]> => {
    const response = await api.get(`/ecoles/${ecoleId}/filieres`);
    return response.data;
  },

  // Créer une filière
  create: async (data: Partial<Filiere>): Promise<Filiere> => {
    const response = await api.post('/filieres', data);
    return response.data;
  },

  // Mettre à jour une filière
  update: async (id: number, data: Partial<Filiere>): Promise<Filiere> => {
    const response = await api.put(`/filieres/${id}`, data);
    return response.data;
  },

  // Supprimer une filière
  delete: async (id: number): Promise<void> => {
    await api.delete(`/filieres/${id}`);
  },
};
