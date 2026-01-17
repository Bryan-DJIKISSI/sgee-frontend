import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { enrollmentService } from '../services/enrollmentService'
import { ecoleService } from '../services/ecoleService'
import { concoursService } from '../services/concoursService'
import DashboardLayout from '../components/DashboardLayout'
import DocumentUploader from '../components/DocumentUploader'
import { 
  ArrowRight, ArrowLeft, School, Building2, CheckCircle, BookOpen
} from 'lucide-react'

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
  logo_path?: string
}

interface Departement {
  id_departement: number
  intitule: string
  description?: string
  code_depart: string
}

interface Filiere {
  id_filiere: number
  intitule: string
  code_filiere: string
  niveau: string
  duree_ans: number
}

interface Concours {
  id_concours: number
  intitule: string
  description?: string
  date_debut: string
  date_fin: string
  date_limite_inscription: string
  niveau_requis: string
  frais_inscription: number
  statut: string
  ecole?: {
    nom_ecole: string
  }
}

interface EnrollmentFormData {
  id_ecole: number
  id_departement: string
  id_filiere: string
  annee_academique: string
}

const NewEnrollmentForm = () => {
  const [searchParams] = useSearchParams()
  const { ecoleId: ecoleIdParam } = useParams<{ ecoleId: string }>()
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [ecole, setEcole] = useState<Ecole | null>(null)
  const [concours, setConcours] = useState<Concours | null>(null)
  const [departements, setDepartements] = useState<Departement[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [documents, setDocuments] = useState<{ type: string; file: File }[]>([])
  const [loadingEcole, setLoadingEcole] = useState(true)
  const [loadingDepartements, setLoadingDepartements] = useState(false)
  const [loadingFilieres, setLoadingFilieres] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm<EnrollmentFormData>({
    defaultValues: {
      annee_academique: '2025-2026'
    }
  })

  const ecoleId = ecoleIdParam || searchParams.get('ecole')
  const concoursId = searchParams.get('concours')
  const selectedDepartement = watch('id_departement')

  // Documents requis selon le niveau
  const getRequiredDocuments = (niveau: string) => {
    const documentsMap: { [key: string]: { [key: string]: string } } = {
      'L1': {
        'releve_bac': 'Relevé du Baccalauréat',
        'photocopie_bac_legalisee': 'Photocopie légalisée du Baccalauréat',
        'releve_probatoire': 'Relevé du Probatoire',
        'photocopie_probatoire_legalisee': 'Photocopie légalisée du Probatoire',
        'acte_naissance': 'Acte de naissance (original)',
        'photocopie_acte_legalisee': 'Photocopie légalisée de l\'acte de naissance',
        'justificatif_paiement': 'Justificatif de paiement',
      },
      'L2': {
        'releves_notes_l1': 'Relevés de notes L1',
        'attestation_reussite': 'Attestation de réussite',
        'acte_naissance': 'Acte de naissance',
        'justificatif_paiement': 'Justificatif de paiement',
      },
      'L3': {
        'releves_notes_l1_l2': 'Relevés de notes L1 et L2',
        'attestation_reussite': 'Attestation de réussite',
        'acte_naissance': 'Acte de naissance',
        'justificatif_paiement': 'Justificatif de paiement',
      },
      'Master': {
        'diplome_licence': 'Diplôme de Licence',
        'releves_notes_licence': 'Relevés de notes Licence',
        'acte_naissance': 'Acte de naissance',
        'cv': 'Curriculum Vitae',
        'lettre_motivation': 'Lettre de motivation',
        'justificatif_paiement': 'Justificatif de paiement',
      }
    }
    return documentsMap[niveau] || documentsMap['L1']
  }

  useEffect(() => {
    if (ecoleId) {
      loadEcole(parseInt(ecoleId))
      loadDepartements(parseInt(ecoleId))
    } else {
      setLoadingEcole(false)
    }
    
    if (concoursId) {
      loadConcours(parseInt(concoursId))
    }
  }, [ecoleId, concoursId])

  useEffect(() => {
    if (selectedDepartement) {
      loadFilieres(parseInt(selectedDepartement))
    } else {
      setFilieres([])
    }
  }, [selectedDepartement])

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
        
        if (concoursData.statut !== 'ouvert') {
          toast.warning('Ce concours n\'est pas ouvert aux inscriptions.')
          setTimeout(() => navigate('/concours'), 3000)
        }
        
        const dateLimite = new Date(concoursData.date_limite_inscription)
        if (new Date() > dateLimite) {
          toast.error('La date limite d\'inscription est dépassée.')
          setTimeout(() => navigate('/concours'), 3000)
        }
      }
    } catch (error) {
      toast.error('Erreur lors du chargement du concours')
    }
  }

  const loadDepartements = async (ecoleId: number) => {
    setLoadingDepartements(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ecoles/${ecoleId}/departements`)
      const data = await response.json()
      if (data.success) {
        setDepartements(data.data || [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des départements')
    } finally {
      setLoadingDepartements(false)
    }
  }

  const loadFilieres = async (departementId: number) => {
    setLoadingFilieres(true)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/departements/${departementId}/filieres`)
      const data = await response.json()
      if (data.success) {
        setFilieres(data.data || [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des filières')
    } finally {
      setLoadingFilieres(false)
    }
  }

  const onSubmit = async (data: EnrollmentFormData) => {
    if (!concoursId) {
      toast.error('Aucun concours sélectionné')
      return
    }

    // Vérifier que tous les documents sont uploadés
    const requiredDocs = getRequiredDocuments(concours?.niveau_requis || 'L1')
    const requiredTypes = Object.keys(requiredDocs)
    const uploadedTypes = documents.map(d => d.type)
    
    const missingDocs = requiredTypes.filter(type => !uploadedTypes.includes(type))
    if (missingDocs.length > 0) {
      toast.error('Veuillez uploader tous les documents requis')
      return
    }

    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('id_ecole', ecoleId || '')
      formData.append('id_concours', concoursId)
      formData.append('id_departement', data.id_departement)
      formData.append('id_filiere', data.id_filiere)
      formData.append('annee_academique', data.annee_academique)
      
      // Ajouter les documents
      documents.forEach((doc, index) => {
        formData.append(`documents[${index}][type]`, doc.type)
        formData.append(`documents[${index}][file]`, doc.file)
      })

      const response = await enrollmentService.create(formData)
      if (response.success) {
        toast.success('🎉 Inscription validée automatiquement ! Vous allez recevoir un email de confirmation.', {
          autoClose: 5000,
          position: 'top-center',
        })
        
        setTimeout(() => {
          navigate('/my-enrollments')
        }, 1500)
      }
    } catch (error: any) {
      console.error('Erreur inscription:', error)
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'inscription.'
      toast.error(errorMessage, { autoClose: 5000 })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1) {
      if (!watch('id_departement') || !watch('id_filiere')) {
        toast.error('Veuillez sélectionner un département et une filière')
        return
      }
    }
    if (step === 2) {
      const requiredDocs = getRequiredDocuments(concours?.niveau_requis || 'L1')
      const requiredTypes = Object.keys(requiredDocs)
      const uploadedTypes = documents.map(d => d.type)
      const missingDocs = requiredTypes.filter(type => !uploadedTypes.includes(type))
      
      if (missingDocs.length > 0) {
        toast.error('Veuillez uploader tous les documents requis')
        return
      }
    }
    setStep(step + 1)
  }
  
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
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg"
            >
              Voir les concours
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!concoursId) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto">
          <div className="bg-amber-50 rounded-2xl shadow-lg p-12 text-center border-2 border-amber-200">
            <School className="h-16 w-16 text-amber-600 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Concours non sélectionné</h3>
            <p className="text-gray-700 mb-6">
              Veuillez sélectionner un concours pour continuer votre inscription.
            </p>
            <button
              onClick={() => navigate('/concours')}
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg"
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
                  />
                </div>
              ) : (
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-white">{ecole.nom_ecole}</h1>
                {ecole.sigle && <p className="text-white/90">{ecole.sigle}</p>}
              </div>
            </div>
            
            {concours && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mt-4 border border-white/20">
                <p className="text-xl text-white font-semibold mb-2">{concours.intitule}</p>
                <div className="grid md:grid-cols-3 gap-4 text-sm text-white/90">
                  <div>
                    <span className="block text-white/70">Niveau requis</span>
                    <span className="font-semibold">{concours.niveau_requis}</span>
                  </div>
                  <div>
                    <span className="block text-white/70">Inscription avant</span>
                    <span className="font-semibold">{new Date(concours.date_limite_inscription).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div>
                    <span className="block text-white/70">Frais</span>
                    <span className="font-semibold">{concours.frais_inscription.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>
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
              Département & Filière
            </span>
            <span className={`text-sm font-medium ${step >= 2 ? 'text-primary-600' : 'text-gray-600'}`}>
              Documents
            </span>
            <span className={`text-sm font-medium ${step >= 3 ? 'text-primary-600' : 'text-gray-600'}`}>
              Vérification
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            {/* Step 1: Département & Filière */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Choix du département et de la filière</h2>
                    <p className="text-gray-600">Sélectionnez votre parcours académique</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Département <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('id_departement', { required: 'Le département est requis' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      disabled={loadingDepartements}
                    >
                      <option value="">
                        {loadingDepartements ? 'Chargement...' : 'Sélectionnez un département'}
                      </option>
                      {departements.map((dept) => (
                        <option key={dept.id_departement} value={dept.id_departement}>
                          {dept.intitule}
                        </option>
                      ))}
                    </select>
                    {errors.id_departement && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_departement.message}</p>
                    )}
                    {departements.length > 0 && (
                      <p className="mt-2 text-xs text-gray-600">
                        {departements.length} département(s) disponible(s)
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Filière <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('id_filiere', { required: 'La filière est requise' })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-gray-100"
                      disabled={!selectedDepartement || loadingFilieres}
                    >
                      <option value="">
                        {!selectedDepartement 
                          ? 'Sélectionnez d\'abord un département' 
                          : loadingFilieres 
                          ? 'Chargement...' 
                          : 'Sélectionnez une filière'
                        }
                      </option>
                      {filieres.map((fil) => (
                        <option key={fil.id_filiere} value={fil.id_filiere}>
                          {fil.intitule} ({fil.niveau} - {fil.duree_ans} ans)
                        </option>
                      ))}
                    </select>
                    {errors.id_filiere && (
                      <p className="mt-1 text-sm text-red-600">{errors.id_filiere.message}</p>
                    )}
                    {selectedDepartement && filieres.length > 0 && (
                      <p className="mt-2 text-xs text-gray-600">
                        {filieres.length} filière(s) disponible(s)
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

            {/* Step 2: Documents */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Documents requis</h2>
                    <p className="text-gray-600">Uploadez tous les documents nécessaires</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-xl p-6 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3">📋 Instructions importantes</h4>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Tous les documents sont obligatoires</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Formats acceptés : PDF, JPG, PNG</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Taille maximale par fichier : 5 MB</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span>Assurez-vous que les documents sont lisibles</span>
                    </li>
                  </ul>
                </div>

                <DocumentUploader
                  requiredDocuments={getRequiredDocuments(concours?.niveau_requis || 'L1')}
                  onDocumentsChange={setDocuments}
                />
              </div>
            )}

            {/* Step 3: Vérification */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Vérification finale</h2>
                    <p className="text-gray-600">Vérifiez vos informations avant de soumettre</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">📚 Parcours sélectionné</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Département</p>
                        <p className="font-semibold text-gray-900">
                          {departements.find(d => d.id_departement === parseInt(watch('id_departement')))?.intitule}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Filière</p>
                        <p className="font-semibold text-gray-900">
                          {filieres.find(f => f.id_filiere === parseInt(watch('id_filiere')))?.intitule}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-bold text-gray-900 mb-4">📄 Documents uploadés</h3>
                    <div className="space-y-2">
                      {documents.map((doc, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-green-200">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{doc.file.name}</p>
                            <p className="text-xs text-gray-600">
                              {getRequiredDocuments(concours?.niveau_requis || 'L1')[doc.type]}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-green-50 border-2 border-green-300 rounded-xl p-6">
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="h-6 w-6 text-green-600 mt-1" />
                      <div>
                        <h4 className="font-bold text-green-900 mb-2">✅ Validation automatique</h4>
                        <p className="text-sm text-green-800">
                          Votre inscription sera validée automatiquement après soumission. 
                          Vous recevrez immédiatement un email de confirmation avec votre reçu d'inscription.
                        </p>
                      </div>
                    </div>
                  </div>
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

export default NewEnrollmentForm
