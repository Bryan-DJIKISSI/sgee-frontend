import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService } from '../services/authService'
import { User, LoginFormData, RegisterFormData } from '../types'

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
    setUser(data.user || null)
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
