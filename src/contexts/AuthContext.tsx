import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'

interface User {
  id_user: number
  email: string
  name: string
  surname?: string
  role?: {
    id_role: number
    intitule: string
  }
}

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  name: string
  surname?: string
  email: string
  password: string
  password_confirmation: string
  matricule: string
  date_naiss: string
  lieu_naiss: string
  sexe: string
  nationalite: string
  adresse: string
  region_origine: string
  departement_origine: string
  num_cni: string
  nom_pere: string
  prenom_pere?: string
  tel_pere: string
  nom_mere: string
  prenom_mere?: string
  tel_mere: string
}

interface AuthContextType {
  user: User | null
  login: (credentials: LoginFormData) => Promise<any>
  register: (userData: RegisterFormData) => Promise<any>
  logout: () => Promise<void>
  isAdmin: () => boolean
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (credentials: LoginFormData) => {
    const data = await authService.login(credentials)
    if (data.user) {
      setUser(data.user)
    }
    return data
  }

  const register = async (userData: RegisterFormData) => {
    return await authService.register(userData)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const isAdmin = (): boolean => {
    return user?.role?.intitule === 'ADMIN'
  }

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAdmin,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
