import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Mail, Lock, User, Calendar, MapPin, Phone, CreditCard, BookOpen } from 'lucide-react'
import { regionService } from '../../services/regionService'

interface Region {
  nom: string
  code: string
  departements: string[]
}

interface RegisterFormData {
  name: string
  surname?: string
  email: string
  password: string
  password_confirmation: string
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

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>()
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState<Region[]>([])
  const [departements, setDepartements] = useState<string[]>([])
  const selectedRegion = watch('region_origine')

  useEffect(() => {
    loadRegions()
  }, [])

  useEffect(() => {
    if (selectedRegion) {
      loadDepartements(selectedRegion)
    } else {
      setDepartements([])
    }
  }, [selectedRegion])

  const loadRegions = async () => {
    try {
      const response = await regionService.getAll()
      if (response.success && response.data) {
        setRegions(response.data)
      }
    } catch (error) {
      console.error('Erreur chargement régions:', error)
    }
  }

  const loadDepartements = async (regionCode: string) => {
    try {
      const response = await regionService.getDepartementsByRegion(regionCode)
      if (response.success && response.data) {
        setDepartements(response.data.departements)
      }
    } catch (error) {
      console.error('Erreur chargement départements:', error)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)
    try {
      // Générer un matricule unique de 10 caractères max
      const timestamp = Date.now().toString().slice(-6) // 6 derniers chiffres
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0') // 3 chiffres
      const matricule = 'M' + timestamp + random // M + 6 + 3 = 10 caractères
      
      // Préparer les données pour le backend
      const registerData = {
        ...data,
        matricule,
        password_confirmation: data.password,
      }
      
      console.log('Données envoyées:', registerData)
      
      const response = await registerUser(registerData)
      
      // Afficher le code de vérification en développement
      if (response.verification_code) {
        console.log('🔑 CODE DE VÉRIFICATION:', response.verification_code)
        toast.info(`Code de vérification: ${response.verification_code}`, { autoClose: 10000 })
      }
      
      toast.success('Inscription réussie ! Vérifiez votre email.')
      navigate('/verify-email', { state: { email: data.email } })
    } catch (error: any) {
      console.error('Erreur inscription complète:', error)
      console.error('Response data:', error.response?.data)
      
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription'
      const errors = error.response?.data?.errors
      
      if (errors) {
        console.log('Erreurs de validation:', errors)
        Object.keys(errors).forEach(key => {
          const errorMsg = `${key}: ${errors[key][0]}`
          console.error(errorMsg)
          toast.error(errorMsg, { autoClose: 5000 })
        })
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-xl mb-4">
            <UserPlus className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Créer un compte</h2>
          <p className="text-gray-600">
            Rejoignez des milliers de candidats qui nous font confiance
          </p>
          <p className="mt-4 text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
              Se connecter
            </Link>
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Informations de connexion */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center mr-3">
                  <Mail className="h-5 w-5 text-primary-600" />
                </div>
                Informations de connexion
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="votre@email.com"
                  />
                  {errors.email && <p className="mt-2 text-sm text-red-600">⚠ {errors.email.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mot de passe *
                  </label>
                  <input
                    {...register('password', {
                      required: 'Le mot de passe est requis',
                      minLength: { value: 6, message: 'Minimum 6 caractères' }
                    })}
                    type="password"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                  />
                  {errors.password && <p className="mt-2 text-sm text-red-600">⚠ {errors.password.message}</p>}
                </div>
              </div>
            </div>

            {/* Informations personnelles */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-secondary-100 rounded-lg flex items-center justify-center mr-3">
                  <User className="h-5 w-5 text-secondary-600" />
                </div>
                Informations personnelles
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom *
                  </label>
                  <input
                    {...register('name', { required: 'Le nom est requis' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Votre nom"
                  />
                  {errors.name && <p className="mt-2 text-sm text-red-600">⚠ {errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                  </label>
                  <input
                    {...register('surname')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Votre prénom"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date de naissance *
                  </label>
                  <input
                    {...register('date_naiss', { required: 'La date de naissance est requise' })}
                    type="date"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  />
                  {errors.date_naiss && <p className="mt-2 text-sm text-red-600">⚠ {errors.date_naiss.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lieu de naissance *
                  </label>
                  <input
                    {...register('lieu_naiss', { required: 'Le lieu de naissance est requis' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Ville de naissance"
                  />
                  {errors.lieu_naiss && <p className="mt-2 text-sm text-red-600">⚠ {errors.lieu_naiss.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sexe *
                  </label>
                  <select 
                    {...register('sexe', { required: 'Le sexe est requis' })} 
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Sélectionner</option>
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                  {errors.sexe && <p className="mt-2 text-sm text-red-600">⚠ {errors.sexe.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nationalité *
                  </label>
                  <input
                    {...register('nationalite', { required: 'La nationalité est requise' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Camerounaise"
                    defaultValue="Camerounaise"
                  />
                  {errors.nationalite && <p className="mt-2 text-sm text-red-600">⚠ {errors.nationalite.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    CNI *
                  </label>
                  <input
                    {...register('num_cni', { required: 'Le numéro CNI est requis' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Numéro CNI"
                  />
                  {errors.num_cni && <p className="mt-2 text-sm text-red-600">⚠ {errors.num_cni.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Adresse *
                  </label>
                  <input
                    {...register('adresse', { required: 'L\'adresse est requise' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Votre adresse"
                  />
                  {errors.adresse && <p className="mt-2 text-sm text-red-600">⚠ {errors.adresse.message}</p>}
                </div>
              </div>
            </div>

            {/* Origine géographique */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-accent-100 rounded-lg flex items-center justify-center mr-3">
                  <MapPin className="h-5 w-5 text-accent-600" />
                </div>
                Origine géographique
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Région d'origine *
                  </label>
                  <select
                    {...register('region_origine', { required: 'La région est requise' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                  >
                    <option value="">Sélectionner une région</option>
                    {regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.nom}
                      </option>
                    ))}
                  </select>
                  {errors.region_origine && <p className="mt-2 text-sm text-red-600">⚠ {errors.region_origine.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Département d'origine *
                  </label>
                  <select
                    {...register('departement_origine', { required: 'Le département est requis' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    disabled={!selectedRegion}
                  >
                    <option value="">Sélectionner un département</option>
                    {departements.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                  {errors.departement_origine && <p className="mt-2 text-sm text-red-600">⚠ {errors.departement_origine.message}</p>}
                </div>
              </div>
            </div>

            {/* Informations parents */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center mr-3">
                  <Phone className="h-5 w-5 text-teal-600" />
                </div>
                Informations des parents
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom du père *
                  </label>
                  <input
                    {...register('nom_pere', { required: 'Le nom du père est requis' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nom du père"
                  />
                  {errors.nom_pere && <p className="mt-2 text-sm text-red-600">⚠ {errors.nom_pere.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom du père
                  </label>
                  <input
                    {...register('prenom_pere')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Prénom du père"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone du père *
                  </label>
                  <input
                    {...register('tel_pere', { required: 'Le téléphone du père est requis' })}
                    type="tel"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="+237 XXX XXX XXX"
                  />
                  {errors.tel_pere && <p className="mt-2 text-sm text-red-600">⚠ {errors.tel_pere.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de la mère *
                  </label>
                  <input
                    {...register('nom_mere', { required: 'Le nom de la mère est requis' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Nom de la mère"
                  />
                  {errors.nom_mere && <p className="mt-2 text-sm text-red-600">⚠ {errors.nom_mere.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom de la mère
                  </label>
                  <input
                    {...register('prenom_mere')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="Prénom de la mère"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone de la mère *
                  </label>
                  <input
                    {...register('tel_mere', { required: 'Le téléphone de la mère est requis' })}
                    type="tel"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
                    placeholder="+237 XXX XXX XXX"
                  />
                  {errors.tel_mere && <p className="mt-2 text-sm text-red-600">⚠ {errors.tel_mere.message}</p>}
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-primary-50 border-2 border-primary-200 rounded-xl p-6">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  required
                  className="mt-1 h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label className="ml-3 text-sm text-gray-700">
                  J'accepte les{' '}
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">
                    conditions d'utilisation
                  </a>{' '}
                  et la{' '}
                  <a href="#" className="font-semibold text-primary-600 hover:text-primary-700">
                    politique de confidentialité
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
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
                  Inscription en cours...
                </span>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>
        </div>

        {/* Back to home */}
        <div className="mt-6 text-center">
          <Link to="/" className="inline-flex items-center text-sm text-gray-600 hover:text-primary-600 transition-colors">
            <BookOpen className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
