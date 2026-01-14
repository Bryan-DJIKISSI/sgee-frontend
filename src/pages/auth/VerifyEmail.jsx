import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { authService } from '../../services/authService'
import { Mail, CheckCircle } from 'lucide-react'

const VerifyEmail = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const email = location.state?.email || ''
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email }
  })
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await authService.verifyEmail(data.email, data.code)
      toast.success('Email vérifié avec succès !')
      navigate('/login')
    } catch (error) {
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
      toast.success('Code renvoyé avec succès !')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors du renvoi')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Vérification Email</h2>
          <p className="mt-2 text-sm text-gray-600">
            Un code de vérification a été envoyé à votre adresse email
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="inline h-4 w-4 mr-1" />
                Email
              </label>
              <input
                {...register('email', { required: 'L\'email est requis' })}
                type="email"
                className="input-field"
                placeholder="votre@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code de vérification
              </label>
              <input
                {...register('code', { required: 'Le code est requis' })}
                type="text"
                className="input-field text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
              />
              {errors.code && (
                <p className="mt-1 text-sm text-red-600">{errors.code.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resending}
                className="text-sm text-primary-600 hover:text-primary-500 disabled:opacity-50"
              >
                {resending ? 'Envoi en cours...' : 'Renvoyer le code'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
