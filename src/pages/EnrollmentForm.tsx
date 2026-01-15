import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { enrollmentService } from '../services/enrollmentService'
import { ecoleService } from '../services/ecoleService'
import { regionService } from '../services/regionService'
import { centreService } from '../services/centreService'
import DashboardLayout from '../components/DashboardLayout'
import { 
  Upload, MapPin, CheckCircle, 
  ArrowRight, ArrowLeft, School, Building2
} from 'lucide-react'

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
  logo_path?: string
}

interface Concours {
  id_concours: number
  intitule: string
  description?: string
  date_debut: string
  date_fin: string
  date_limite_inscription: string
  date_limite_paiement: string
  date_limite_depot: string
  id_ecole: number
  ecole?: {
    id_ecole: number
    nom_ecole: string
    sigle?: string
  }
  niveau_requis: string
  frais_inscription: number
  places_disponibles: number
  statut: string
}

interface Region {
  nom: string
  code: string
  departements: string[]
}

interface EnrollmentFormData {
  id_ecole: number
  region_origine: string
  departement_origine: string
  id_centre_depot: string
  id_centre_exam: string
  date_concour: string
  justificatif_paiement: FileList
  annee_academique: string
}

const EnrollmentForm = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [ecole, setEcole] = useState<Ecole | null>(null)
  const [concours, setConcours] = useState<Concours | null>(null)
  const [loadingEcole, setLoadingEcole] = useState(true)
  const [regions, setRegions] = useState<Region[]>([])
  const [departements, setDepartements] = useState<string[]>([])
  const [loadingDepartements, setLoadingDepartements] = useState(false)
  const [centresDepot, setCentresDepot] = useState<any[]>([])
  const [centresExam, setCentresExam] = useState<any[]>([])
  const [loadingCentres, setLoadingCentres] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EnrollmentFormData>({
    defaultValues: {
      annee_academique: '2025-2026'
    }
  })

  const ecoleId = searchParams.get('ecole')
  const concoursId = searchParams.get('concours')
  const selectedRegion = watch('region_origine')

  useEffect(() => {
    loadRegions()
    loadCentres()
    if (ecoleId) {
      loadEcole(parseInt(ecoleId))
    } else {
      setLoadingEcole(false)
    }
    
    // Charger le concours si l'ID est fourni
    if (concoursId) {
      loadConcours(parseInt(concoursId))
    }
  }, [ecoleId, concoursId])

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
      toast.error('Erreur lors du chargement des régions')
    }
  }

  const loadDepartements = async (regionCode: string) => {
    setLoadingDepartements(true)
    try {
      const response = await regionService.getDepartementsByRegion(regionCode)
      if (response.success && response.data) {
        setDepartements(response.data.departements)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des départements')
    } finally {
      setLoadingDepartements(false)
    }
  }

  const loadEcole = async (id: number) => {
    try {
      const response = await ecoleService.getById(id)
      if (response.success && response.data) {
        setEcole(response.data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'école')
    } finally {
      setLoadingEcole(false)
    }
  }

  const loadConcours = async (id: number) => {
    try {
      const response = await concoursService.getById(id)
      if (response.success && response.data) {
        const concoursData = response.data
        setConcours(concoursData)
        
        // Vérifier que le concours appartient bien à l'école sélectionnée
        if (ecoleId && concoursData.id_ecole !== parseInt(ecoleId)) {
          toast.error(
            `Ce concours est pour ${concoursData.ecole?.nom_ecole}, pas pour l'école sélectionnée. Vous allez être redirigé.`,
            { autoClose: 5000 }
          )
          setTimeout(() => {
            navigate('/concours')
          }, 3000)
        }
        
        // Vérifier que le concours est ouvert
        if (concoursData.statut !== 'ouvert') {
          toast.warning(
            `Ce concours est actuellement ${concoursData.statut}. Les inscriptions ne sont pas disponibles.`,
            { autoClose: 5000 }
          )
          setTimeout(() => {
            navigate('/concours')
          }, 3000)
        }
        
        // Vérifier que la date limite d'inscription n'est pas dépassée
        const dateLimite = new Date(concoursData.date_limite_inscription)
        const now = new Date()
        if (now > dateLimite) {
          toast.error(
            'La date limite d\'inscription pour ce concours est dépassée.',
            { autoClose: 5000 }
          )
          setTimeout(() => {
            navigate('/concours')
          }, 3000)
        }
      }
    } catch (error) {
      console.error('Erreur chargement concours:', error)
      toast.error('Erreur lors du chargement du concours')
    }
  }

  const loadCentres = async () => {
    setLoadingCentres(true)
    try {
      const [depotsRes, examsRes] = await Promise.all([
        centreService.getDepots(),
        centreService.getExams()
      ])
      
      if (depotsRes.success && depotsRes.data) {
        setCentresDepot(depotsRes.data)
      }
      
      if (examsRes.success && examsRes.data) {
        setCentresExam(examsRes.data)
      }
    } catch (error) {
      console.error('Erreur chargement centres:', error)
      toast.error('Erreur lors du chargement des centres')
    } finally {
      setLoadingCentres(false)
    }
  }

  const onSubmit = async (data: EnrollmentFormData) => {
    // Vérifier à nouveau que le concours est valide avant de soumettre
    if (concoursId && concours) {
      if (concours.id_ecole !== parseInt(ecoleId || '0')) {
        toast.error('Le concours ne correspond pas à l\'école sélectionnée')
        return
      }
      
      if (concours.statut !== 'ouvert') {
        toast.error('Ce concours n\'est pas ouvert aux inscriptions')
        return
      }
      
      const dateLimite = new Date(concours.date_limite_inscription)
      const now = new Date()
      if (now > dateLimite) {
        toast.error('La date limite d\'inscription est dépassée')
        return
      }
    }
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('id_ecole', ecoleId || '')
      
      // Ajouter l'ID du concours si disponible
      if (concoursId) {
        formData.append('id_concours', concoursId)
      }
      
      formData.append('region_origine', data.region_origine)
      formData.append('departement_origine', data.departement_origine)
      formData.append('id_centre_depot', data.id_centre_depot)
      formData.append('id_centre_exam', data.id_centre_exam)
      formData.append('date_concour', data.date_concour)
      formData.append('annee_academique', data.annee_academique)
      
      if (data.justificatif_paiement && data.justificatif_paiement[0]) {
        formData.append('justificatif_paiement', data.justificatif_paiement[0])
      }

      const response = await enrollmentService.create(formData)
      if (response.success) {
        toast.success('Inscription enregistrée avec succès!')
        navigate('/my-enrollments')
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setStep(step + 1)
  const prevStep = () => setStep(step - 1)

  if (loadingEcole) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (!ecoleId || !ecole) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <School className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">École non sélectionnée</h3>
            <p className="text-gray-600 mb-6">
              Veuillez d'abord sélectionner une école pour commencer votre inscription.
            </p>
            <button
              onClick={() => navigate('/concours')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Voir les concours
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Avertissement si aucun concours n'est sélectionné
  if (!concoursId) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-50 rounded-2xl shadow-lg p-12 text-center border-2 border-amber-200">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="h-8 w-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Concours non sélectionné</h3>
            <p className="text-gray-700 mb-6">
              Pour vous inscrire, vous devez d'abord sélectionner un concours spécifique. 
              Veuillez retourner à la liste des concours disponibles et choisir celui auquel vous souhaitez participer.
            </p>
            <button
              onClick={() => navigate('/concours')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Voir les concours disponibles
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-secondary-600 to-teal-600 rounded-2xl shadow-2xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center space-x-4 mb-4">
              {ecole.logo_path ? (
                <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden">
                  <img 
                    src={`${import.meta.env.VITE_BASE_URL}/storage/${ecole.logo_path}`}
                    alt={ecole.nom_ecole}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{ecole.nom_ecole}</h1>
                {ecole.sigle && <p className="text-white/90">{ecole.sigle}</p>}
              </div>
            </div>
            
            {concours ? (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4 border border-white/20">
                <p className="text-xl text-white font-semibold mb-2">{concours.intitule}</p>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-white/90">
                  <div>
                    <span className="block text-white/70">Date du concours</span>
                    <span className="font-semibold">{new Date(concours.date_debut).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="block text-white/70">Inscription avant</span>
                    <span className="font-semibold">{new Date(concours.date_limite_inscription).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="block text-white/70">Frais d'inscription</span>
                    <span className="font-semibold">{concours.frais_inscription.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xl text-white/90">
                Formulaire d'inscription au concours
              </p>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold transition-all ${
                  step >= s 
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s ? <CheckCircle className="h-6 w-6" /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${
                    step > s ? 'bg-gradient-to-r from-primary-600 to-secondary-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-4">
            <span className={`text-sm font-medium ${step >= 1 ? 'text-primary-600' : 'text-gray-600'}`}>
              Origine
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-primary-600' : 'text-gray-600'}`}>
              Centres
            </span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-primary-600' : 'text-gray-600'}`}>
              Paiement
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Step 1: Origine géographique */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Origine géographique</h2>
                    <p className="text-gray-600">Sélectionnez votre région et département d'origine</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                    Informations importantes
                  </h4>
                  <p className="text-sm text-gray-700">
                    Veuillez sélectionner votre région d'origine parmi les 10 régions du Cameroun, 
                    puis choisir votre département d'origine parmi les 58 départements disponibles.
                  </p>
                </div>
                  
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Région d'origine <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('region_origine', { required: 'La région est requise' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    >
                      <option value="">Sélectionnez une région</option>
                      {regions.map((region) => (
                        <option key={region.code} value={region.code}>
                          {region.nom}
                        </option>
                      ))}
                    </select>
                    {errors.region_origine && (
                      <p className="mt-1 text-sm text-red-600">{errors.region_origine.message}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-600">
                      {regions.length} régions disponibles
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Département d'origine <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('departement_origine', { required: 'Le département est requis' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!selectedRegion || loadingDepartements}
                    >
                      <option value="">
                        {!selectedRegion 
                          ? 'Sélectionnez d\'abord une région' 
                          : loadingDepartements 
                          ? 'Chargement...' 
                          : 'Sélectionnez un département'
                        }
                      </option>
                      {departements.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                    {errors.departement_origine && (
                      <p className="mt-1 text-sm text-red-600">{errors.departement_origine.message}</p>
                    )}
                    {selectedRegion && departements.length > 0 && (
                      <p className="mt-2 text-xs text-gray-600">
                        {departements.length} départements dans cette région
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Année académique
                  </label>
                  <input
                    type="text"
                    {...register('annee_academique')}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            )}

            {/* Step 2: Centres */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Centres d'examen et de dépôt</h2>
                    <p className="text-gray-600">Choisissez vos centres</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                    <MapPin className="h-5 w-5 text-primary-600 mr-2" />
                    Informations importantes
                  </h4>
                  <p className="text-sm text-gray-700">
                    Sélectionnez le centre où vous déposerez votre dossier physique et le centre où vous passerez l'examen.
                    Ces centres peuvent être différents selon votre localisation.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Centre de dépôt <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('id_centre_depot', { required: 'Le centre de dépôt est requis' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      disabled={loadingCentres}
                    >
                      <option value="">
                        {loadingCentres ? 'Chargement...' : 'Sélectionnez un centre de dépôt'}
                      </option>
                      {centresDepot.map((centre) => (
                        <option key={centre.id_centre} value={centre.id_centre}>
                          {centre.nom_centre} - {centre.ville} ({centre.region})
                        </option>
                      ))}
                    </select>
                    {errors.id_centre_depot && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_centre_depot.message}</p>
                    )}
                    {centresDepot.length > 0 && (
                      <p className="mt-2 text-xs text-gray-600">
                        {centresDepot.length} centres de dépôt disponibles
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Centre d'examen <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('id_centre_exam', { required: 'Le centre d\'examen est requis' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      disabled={loadingCentres}
                    >
                      <option value="">
                        {loadingCentres ? 'Chargement...' : 'Sélectionnez un centre d\'examen'}
                      </option>
                      {centresExam.map((centre) => (
                        <option key={centre.id_centre} value={centre.id_centre}>
                          {centre.nom_centre} - {centre.ville} ({centre.region})
                        </option>
                      ))}
                    </select>
                    {errors.id_centre_exam && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_centre_exam.message}</p>
                    )}
                    {centresExam.length > 0 && (
                      <p className="mt-2 text-xs text-gray-600">
                        {centresExam.length} centres d'examen disponibles
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date du concours <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...register('date_concour', { required: 'La date est requise' })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    value={concours?.date_debut || ''}
                    readOnly
                  />
                  {errors.date_concour && (
                    <p className="mt-1 text-sm text-red-600">{errors.date_concour.message}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-600">
                    Date du concours (automatique)
                  </p>
                </div>
              </div>
            )}

            {/* Step 3: Paiement */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <Upload className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Justificatif de paiement</h2>
                    <p className="text-gray-600">Téléchargez votre reçu bancaire</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Instructions importantes</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Le fichier doit être au format PDF, JPG ou PNG</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Taille maximale: 5 MB</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Le reçu doit être lisible et complet</span>
                    </li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Justificatif de paiement <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      {...register('justificatif_paiement', { required: 'Le justificatif est requis' })}
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                    />
                  </div>
                  {errors.justificatif_paiement && (
                    <p className="mt-1 text-sm text-red-600">{errors.justificatif_paiement.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
              {step > 1 && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all"
                >
                  <ArrowLeft className="h-5 w-5 mr-2" />
                  Précédent
                </button>
              )}
              
              {step < 3 ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all ml-auto"
                >
                  Suivant
                  <ArrowRight className="h-5 w-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all ml-auto disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      <span>Envoi en cours...</span>
                    </div>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Soumettre l'inscription
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}

export default EnrollmentForm
