// Types pour l'authentification
export interface User {
  id_user: number
  email: string
  name: string
  surname?: string
  id_candidat?: number
  id_role: number
  role?: Role
  candidat?: Candidat
  created_at?: string
  updated_at?: string
}

export interface Role {
  id_role: number
  intitule: string
  created_at?: string
  updated_at?: string
}

export interface Candidat {
  id_candidat: number
  matricule: string
  date_naiss: string
  lieu_naiss: string
  sexe: string
  nationalite: string
  adresse?: string
  region_origine: string
  departement_origine: string
  cni: string
  nom_pere?: string
  tel_pere?: string
  nom_mere?: string
  tel_mere?: string
}

// Types pour les écoles
export interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
  description?: string
  adresse?: string
  ville?: string
  telephone?: string
  email?: string
  site_web?: string
  bp?: string
  logo_path?: string
  logo_universite_path?: string
  actif: boolean
  // Informations officielles FR
  republique_fr?: string
  devise_fr?: string
  ministere_fr?: string
  universite_fr?: string
  slogan_fr?: string
  // Informations officielles EN
  republique_en?: string
  devise_en?: string
  ministere_en?: string
  universite_en?: string
  slogan_en?: string
  departements?: Departement[]
  concours?: Concours[]
  created_at?: string
  updated_at?: string
}

export interface Departement {
  id_departement: number
  intitule: string
  description?: string
  code_depart: string
  id_ecole?: number
  filieres?: Filiere[]
  created_at?: string
  updated_at?: string
}

export interface Filiere {
  id_filiere: number
  intitule: string
  code_filiere: string
  niveau?: number
  duree_ans: number
  id_departement: number
  created_at?: string
  updated_at?: string
}

// Types pour les concours
export interface Concours {
  id_concours: number
  intitule: string
  date_debut: string
  date_fin: string
  id_ecole?: number
  pdf_path?: string
  ecole?: Ecole
  created_at?: string
  updated_at?: string
}

export interface Session {
  id_session: number
  nom_session: string
  description?: string
  date_debut: string
  date_fin: string
  pdf_calendrier_path?: string
  created_at?: string
  updated_at?: string
}

// Types pour les inscriptions
export interface Enrollement {
  id_enrollement: number
  date_enrollement: string
  date_limite_inscription: string
  statut?: string
  annee_academique: string
  qr_code?: string
  id_paiement?: number
  id_document?: number
  id_candidat: number
  paiement?: Paiement
  candidat?: Candidat
  created_at?: string
  updated_at?: string
}

export interface Paiement {
  id_paiement: number
  montant: number
  reference_transaction: string
  type_paiement: string
  date_paiement?: string
  valide: boolean
}

export interface Document {
  id_document: number
  type: string
  nom_document: string
  file_path: string
  mime_type?: string
  taille?: string
  uploaded_at: string
}

// Types pour les centres
export interface CentreDepot {
  id_depot: number
  nom_centre: string
  lieu_centre: string
  date_limite: string
  latitude?: number
  longitude?: number
  id_enrollement: number
  created_at?: string
  updated_at?: string
}

export interface CentreExam {
  id_exam: number
  nom_centre: string
  lieu_centre: string
  date_concour: string
  latitude?: number
  longitude?: number
  id_enrollement: number
  id_departement?: number
  created_at?: string
  updated_at?: string
}

// Types pour les régions
export interface Region {
  nom: string
  code: string
  departements: string[]
}

// Types pour les réponses API
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
  errors?: Record<string, string[]>
}

export interface AuthResponse {
  success: boolean
  token?: string
  user?: User
  message?: string
}

// Types pour les formulaires
export interface RegisterFormData {
  name: string
  surname?: string
  email: string
  password: string
  date_naiss: string
  lieu_naiss: string
  sexe: string
  nationalite?: string
  adresse?: string
  region_origine: string
  departement_origine: string
  cni: string
  nom_pere?: string
  tel_pere?: string
  nom_mere?: string
  tel_mere?: string
}

export interface LoginFormData {
  email: string
  password: string
}

export interface EnrollmentFormData {
  id_ecole: number
  id_departement: number
  id_filiere: number
  id_centre_depot: number
  id_centre_exam: number
  justificatif_paiement: File
  annee_academique: string
}
