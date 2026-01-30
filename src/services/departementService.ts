import api from './api';

export interface Departement {
  id_departement: number;
  intitule: string;
  code_depart: string;
  description?: string;
  id_ecole: number;
  created_at?: string;
  updated_at?: string;
}

export const departementService = {
  // Récupérer tous les départements
  getAll: async (): Promise<Departement[]> => {
    const response = await api.get('/departements');
    return response.data;
  },

  // Récupérer un département par ID
  getById: async (id: number): Promise<Departement> => {
    const response = await api.get(`/departements/${id}`);
    return response.data;
  },

  // Récupérer les départements d'une école
  getByEcole: async (ecoleId: number): Promise<Departement[]> => {
    const response = await api.get(`/ecoles/${ecoleId}/departements`);
    return response.data;
  },

  // Créer un département
  create: async (data: Partial<Departement>): Promise<Departement> => {
    const response = await api.post('/departements', data);
    return response.data;
  },

  // Mettre à jour un département
  update: async (id: number, data: Partial<Departement>): Promise<Departement> => {
    const response = await api.put(`/departements/${id}`, data);
    return response.data;
  },

  // Supprimer un département
  delete: async (id: number): Promise<void> => {
    await api.delete(`/departements/${id}`);
  },
};
