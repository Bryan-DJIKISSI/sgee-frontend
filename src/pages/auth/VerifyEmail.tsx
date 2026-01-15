import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { authService } from '../../services/authService'
import { Mail, CheckCircle, RefreshCw } from 'lucide-react'

interface VerifyFormData {
  email: string
  code: string
}

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const { register, handleSubmit, formState: { errors } } = useForm<VerifyFormData>({
    defaultValues: { email }
  })
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const onSubmit = async (data: VerifyFormData) => {
    setLoading(true)
    try {
      const response = await authService.verifyEmail(data.email, data.code)
      
      // Si le backend retourne un token, on connecte automatiquement l'utilisateur
      if (response.token && response.user) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        
        toast.success('Email vérifié avec succès ! Bienvenue 🎉')
        
        // Rediriger vers les concours disponibles pour commencer
        navigate('/concours')
      } else {
        toast.success('Email vérifié avec succès !')
        navigate('/login')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Code invalide')
    } finally {
      setLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!email) {
      toast.error('Email non fourni')
      return
    }
    
    setResending(true)
    try {
      await authService.resendCode(email)
      toast.success('Code renvoyé avec succès ! Vérifiez votre email.')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors du renvoi')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-xl mb-4 animate-pulse">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Vérification Email</h2>
          <p className="text-gray-600">
            Un code de vérification a été envoyé à
          </p>
          <p className="text-primary-600 font-semibold mt-1">{email}</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  {...register('email', { required: 'L\'email est requis' })}
                  type="email"
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  placeholder="votre@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠</span> {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Code de vérification
              </label>
              <input
                {...register('code', { 
                  required: 'Le code est requis',
                  minLength: { value: 6, message: 'Le code doit contenir 6 chiffres' },
                  maxLength: { value: 6, message: 'Le code doit contenir 6 chiffres' }
                })}
                type="text"
                className="w-full px-4 py-4 text-center text-3xl font-bold tracking-widest border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                placeholder="000000"
                maxLength={6}
              />
              {errors.code && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  <span className="mr-1">⚠</span> {errors.code.message}
                </p>
              )}
              <p className="mt-2 text-xs text-gray-500 text-center">
                Entrez le code à 6 chiffres reçu par email
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification...
                </span>
              ) : (
                'Vérifier mon email'
              )}
            </button>
          </form>

          {/* Resend Code */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 mb-3">
              Vous n'avez pas reçu le code ?
            </p>
            <button
              type="button"
              onClick={handleResendCode}
              disabled={resending}
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${resending ? 'animate-spin' : ''}`} />
              {resending ? 'Envoi en cours...' : 'Renvoyer le code'}
            </button>
          </div>

          {/* Info Box */}
          <div className="mt-6 bg-primary-50 border border-primary-200 rounded-xl p-4">
            <p className="text-xs text-gray-600 text-center">
              💡 Vérifiez également votre dossier spam si vous ne trouvez pas l'email
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
