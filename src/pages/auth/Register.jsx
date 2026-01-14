import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Mail, Lock, User, Phone, Calendar, MapPin } from 'lucide-react'
import { regionService } from '../../services/regionService'
import { useEffect } from 'react'

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState([])
  const [departements, setDepartements] = useState([])
  const selectedRegion = watch('region_origine')

  useEffect(() => {
    loadRegions()
  }, [])

  useEffect(() => {
    if (selectedRegion) {
      loadDepartements(selectedRegion)
    }
  }, [selectedRegion])

  const loadRegions = async () => {
    try {
      const response = await regionService.getAll()
      setRegions(response.data)
    } catch (error) {
      console.error('Erreur chargement régions:', error)
    }
  }

  const loadDepartements = async (regionCode) => {
    try {
      const response = await regionService.getDepartementsByRegion(regionCode)
      setDepartements(response.data.departements)
    } catch (error) {
      console.error('Erreur chargement départements:', error)
    }
  }

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      await registerUser(data)
      toast.success('Inscription réussie ! Vérifiez votre email.')
      navigate('/verify-email', { state: { email: data.email } })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Informations personnelles */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom *
                </label>
                <input
                  {...register('nom', { required: 'Le nom est requis' })}
                  className="input-field"
                  placeholder="Votre nom"
                />
                {errors.nom && <p className="mt-1 text-sm text-red-600">{errors.nom.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  {...register('prenom')}
                  className="input-field"
                  placeholder="Votre prénom"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <input
                  {...register('email', {
                    required: 'L\'email est requis',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Email invalide'
                    }
                  })}
                  type="email"
                  className="input-field"
                  placeholder="votre@email.com"
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mot de passe *
                </label>
                <input
                  {...register('password', {
                    required: 'Le mot de passe est requis',
                    minLength: { value: 6, message: 'Minimum 6 caractères' }
                  })}
                  type="password"
                  className="input-field"
                  placeholder="••••••••"
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
              </div>
            </div>

            {/* Informations candidat */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations du candidat</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de naissance *
                  </label>
                  <input
                    {...register('date_naiss', { required: 'La date de naissance est requise' })}
                    type="date"
                    className="input-field"
                  />
                  {errors.date_naiss && <p className="mt-1 text-sm text-red-600">{errors.date_naiss.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lieu de naissance *
                  </label>
                  <input
                    {...register('lieu_naiss', { required: 'Le lieu de naissance est requis' })}
                    className="input-field"
                    placeholder="Ville de naissance"
                  />
                  {errors.lieu_naiss && <p className="mt-1 text-sm text-red-600">{errors.lieu_naiss.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sexe *
                  </label>
                  <select {...register('sexe', { required: 'Le sexe est requis' })} className="input-field">
                    <option value="">Sélectionner</option>
                    <option value="Masculin">Masculin</option>
                    <option value="Féminin">Féminin</option>
                  </select>
                  {errors.sexe && <p className="mt-1 text-sm text-red-600">{errors.sexe.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CNI *
                  </label>
                  <input
                    {...register('cni', { required: 'Le numéro CNI est requis' })}
                    className="input-field"
                    placeholder="Numéro CNI"
                  />
                  {errors.cni && <p className="mt-1 text-sm text-red-600">{errors.cni.message}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Région d'origine *
                  </label>
                  <select
                    {...register('region_origine', { required: 'La région est requise' })}
                    className="input-field"
                  >
                    <option value="">Sélectionner une région</option>
                    {regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.nom}
                      </option>
                    ))}
                  </select>
                  {errors.region_origine && <p className="mt-1 text-sm text-red-600">{errors.region_origine.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Département d'origine *
                  </label>
                  <select
                    {...register('departement_origine', { required: 'Le département est requis' })}
                    className="input-field"
                    disabled={!selectedRegion}
                  >
                    <option value="">Sélectionner un département</option>
                    {departements.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.departement_origine && <p className="mt-1 text-sm text-red-600">{errors.departement_origine.message}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  {...register('adresse')}
                  className="input-field"
                  placeholder="Votre adresse"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Inscription en cours...' : 'S\'inscrire'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
