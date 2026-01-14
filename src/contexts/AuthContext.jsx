import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (token && savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (credentials) => {
    const data = await authService.login(credentials)
    setUser(data.user)
    return data
  }

  const register = async (userData) => {
    return await authService.register(userData)
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const isAdmin = () => {
    return user?.role?.intitule === 'ADMIN'
  }

  const value = {
    user,
    login,
    register,
    logout,
    isAdmin,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
