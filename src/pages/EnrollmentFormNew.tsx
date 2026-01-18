import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import DashboardLayout from '../components/DashboardLayout'
import PaymentReceiptUpload from '../components/PaymentReceiptUpload'
import type { ExtractedPaymentData } from '../types/payment'
import { 
  GraduationCap, MapPin, Upload, CheckCircle, 
  ArrowRight, ArrowLeft, FileText, AlertCircle, CreditCard
} from 'lucide-react'

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
}

interface Departement {
  id_departement: number
  intitule: string
  id_ecole: number
}

interface Filiere {
  id_filiere: number
  intitule: string
  niveau: string
  id_departement: number
}

interface Centre {
  id_centre: number
  nom_centre: string
  ville: string
}

interface DocumentType {
  name: string
  required: boolean
  description: string
}

const DOCUMENT_TYPES_BY_LEVEL: { [key: string]: DocumentType[] } = {
  'L1': [
    { name: 'releve_bacc', required: true, description: 'Relevé de notes du Baccalauréat' },
    { name: 'releve_bacc_copie', required: true, description: 'Photocopie légalisée du relevé du Bacc' },
    { name: 'releve_probatoire', required: true, description: 'Relevé de notes du Probatoire' },
    { name: 'releve_probatoire_copie', required: true, description: 'Photocopie légalisée du relevé du Probatoire' },
    { name: 'acte_naissance', required: true, description: 'Acte de naissance (original)' },
    { name: 'acte_naissance_copie', required: true, description: 'Photocopie légalisée de l\'acte de naissance' },
    { name: 'photo', required: true, description: 'Photo d\'identité récente' },
  ],
  'L2': [
    { name: 'releve_l1', required: true, description: 'Relevé de notes L1' },
    { name: 'attestation_l1', required: true, description: 'Attestation de réussite L1' },
    { name: 'acte_naissance_copie', required: true, description: 'Photocopie légalisée de l\'acte de naissance' },
    { name: 'photo', required: true, description: 'Photo d\'identité récente' },
  ],
  'L3': [
    { name: 'releve_l2', required: true, description: 'Relevé de notes L2' },
    { name: 'attestation_l2', required: true, description: 'Attestation de réussite L2' },
    { name: 'acte_naissance_copie', required: true, description: 'Photocopie légalisée de l\'acte de naissance' },
    { name: 'photo', required: true, description: 'Photo d\'identité récente' },
  ],
  'Master': [
    { name: 'diplome_licence', required: true, description: 'Diplôme de Licence' },
    { name: 'releve_licence', required: true, description: 'Relevé de notes de Licence' },
    { name: 'cv', required: true, description: 'Curriculum Vitae' },
    { name: 'lettre_motivation', required: true, description: 'Lettre de motivation' },
    { name: 'acte_naissance_copie', required: true, description: 'Photocopie légalisée de l\'acte de naissance' },
    { name: 'photo', required: true, description: 'Photo d\'identité récente' },
  ],
}

const EnrollmentFormNew = () => {
  const { ecoleId } = useParams<{ ecoleId: string }>()
  const navigate = useNavigate()
  
  // State
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [ecole, setEcole] = useState<Ecole | null>(null)
  const [departements, setDepartements] = useState<Departement[]>([])
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [centresDepot, setCentresDepot] = useState<Centre[]>([])
  const [centresExam, setCentresExam] = useState<Centre[]>([])
  
  // Form data
  const [selectedDepartement, setSelectedDepartement] = useState('')
  const [selectedFiliere, setSelectedFiliere] = useState<Filiere | null>(null)
  const [selectedCentreDepot, setSelectedCentreDepot] = useState('')
  const [selectedCentreExam, setSelectedCentreExam] = useState('')
  const [documents, setDocuments] = useState<{ [key: string]: File }>({})
  const [paymentReceipt, setPaymentReceipt] = useState<File | null>(null)
  const [paymentData, setPaymentData] = useState<ExtractedPaymentData | null>(null)
  useEffect(() => {
    if (ecoleId) {
      loadEcole(parseInt(ecoleId))
      loadDepartements(parseInt(ecoleId))
    }
    loadCentres()
  }, [ecoleId])

  useEffect(() => {
    if (selectedDepartement) {
      loadFilieres(parseInt(selectedDepartement))
    }
  }, [selectedDepartement])

  const loadEcole = async (id: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ecoles/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setEcole(data.data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'école')
    }
  }

  const loadDepartements = async (ecoleId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ecoles/${ecoleId}/departements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setDepartements(data.data || [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des départements')
    }
  }

  const loadFilieres = async (departementId: number) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/departements/${departementId}/filieres`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setFilieres(data.data || [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des filières')
    }
  }

  const loadCentres = async () => {
    try {
      const token = localStorage.getItem('token')
      const [depotRes, examRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/centre-depots`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/centre-exams`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])
      
      const depotData = await depotRes.json()
      const examData = await examRes.json()
      
      setCentresDepot(depotData.data || depotData || [])
      setCentresExam(examData.data || examData || [])
    } catch (error) {
      toast.error('Erreur lors du chargement des centres')
    }
  }

  const handleFileChange = (docType: string, file: File | null) => {
    if (file) {
      setDocuments(prev => ({ ...prev, [docType]: file }))
    } else {
      setDocuments(prev => {
        const newDocs = { ...prev }
        delete newDocs[docType]
        return newDocs
      })
    }
  }

  const handlePaymentReceiptSelect = (file: File | null, extracted: ExtractedPaymentData | null) => {
    setPaymentReceipt(file)
    setPaymentData(extracted)
  }

  const handleSubmit = async () => {
    if (!selectedFiliere) {
      toast.error('Veuillez sélectionner une filière')
      return
    }

    if (!selectedCentreDepot || !selectedCentreExam) {
      toast.error('Veuillez sélectionner les centres')
      return
    }

    const requiredDocs = DOCUMENT_TYPES_BY_LEVEL[selectedFiliere.niveau] || []
    const missingDocs = requiredDocs.filter(doc => doc.required && !documents[doc.name])
    
    if (missingDocs.length > 0) {
      toast.error(`Documents manquants: ${missingDocs.map(d => d.description).join(', ')}`)
      return
    }

    if (!paymentReceipt) {
      toast.error('Veuillez télécharger le reçu de paiement')
      return
    }

    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const formData = new FormData()
      
      formData.append('id_filiere', selectedFiliere.id_filiere.toString())
      formData.append('id_centre_depot', selectedCentreDepot)
      formData.append('id_centre_exam', selectedCentreExam)
      formData.append('annee_academique', new Date().getFullYear().toString())
      
      // Ajouter tous les documents
      Object.entries(documents).forEach(([key, file]) => {
        formData.append(`documents[${key}]`, file)
      })

      // Ajouter le reçu de paiement
      formData.append('payment_receipt', paymentReceipt)

      // Ajouter les données extraites par OCR si disponibles
      if (paymentData) {
        if (paymentData.montant) formData.append('payment_amount', paymentData.montant)
        if (paymentData.reference) formData.append('payment_reference', paymentData.reference)
        if (paymentData.date) formData.append('payment_date', paymentData.date)
        if (paymentData.banque) formData.append('payment_bank', paymentData.banque)
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/enrollements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success('Inscription soumise avec succès ! Votre candidature a été automatiquement validée.')
        navigate('/my-enrollments')
      } else {
        toast.error(data.message || 'Erreur lors de l\'inscription')
      }
    } catch (error) {
      toast.error('Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (step === 1 && !selectedFiliere) {
      toast.error('Veuillez sélectionner un département et une filière')
      return
    }
    if (step === 2 && (!selectedCentreDepot || !selectedCentreExam)) {
      toast.error('Veuillez sélectionner les centres')
      return
    }
    if (step === 3) {
      const requiredDocs = DOCUMENT_TYPES_BY_LEVEL[selectedFiliere?.niveau || ''] || []
      const missingDocs = requiredDocs.filter(doc => doc.required && !documents[doc.name])
      if (missingDocs.length > 0) {
        toast.error('Veuillez télécharger tous les documents requis')
        return
      }
    }
    if (step === 4 && !paymentReceipt) {
      toast.error('Veuillez télécharger le reçu de paiement')
      return
    }
    setStep(step + 1)
  }

  const prevStep = () => setStep(step - 1)

  const getNiveauBadgeColor = (niveau: string) => {
    const colors: { [key: string]: string } = {
      'L1': 'bg-blue-100 text-blue-700',
      'L2': 'bg-green-100 text-green-700',
      'L3': 'bg-yellow-100 text-yellow-700',
      'Master': 'bg-purple-100 text-purple-700',
    }
    return colors[niveau] || 'bg-gray-100 text-gray-700'
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Formulaire d'Inscription</h1>
              <p className="text-gray-600 mt-1">{ecole?.nom_ecole}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Étape {step} sur 5</p>
              <div className="w-32 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-gradient-to-r from-primary-600 to-secondary-600 h-2 rounded-full transition-all"
                  style={{ width: `${(step / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Steps Indicator */}
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'Département & Filière', icon: GraduationCap },
              { num: 2, label: 'Centres', icon: MapPin },
              { num: 3, label: 'Documents', icon: Upload },
              { num: 4, label: 'Paiement', icon: CreditCard },
              { num: 5, label: 'Vérification', icon: CheckCircle }
            ].map((s) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  step >= s.num 
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <span className={`ml-2 text-sm font-medium hidden md:block ${
                  step >= s.num ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {s.label}
                </span>
                {s.num < 5 && (
                  <div className={`w-8 h-1 mx-2 hidden md:block ${
                    step > s.num ? 'bg-primary-600' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-gray-100">
          {/* Step 1: Département & Filière */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Choisissez votre filière</h2>
                <p className="text-gray-600">Sélectionnez le département et la filière qui vous intéressent</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Département <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedDepartement}
                  onChange={(e) => {
                    setSelectedDepartement(e.target.value)
                    setSelectedFiliere(null)
                  }}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un département</option>
                  {departements.map(dept => (
                    <option key={dept.id_departement} value={dept.id_departement}>
                      {dept.intitule}
                    </option>
                  ))}
                </select>
              </div>

              {selectedDepartement && filieres.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Filière <span className="text-red-500">*</span>
                  </label>
                  <div className="grid md:grid-cols-2 gap-4">
                    {filieres.map(filiere => (
                      <div
                        key={filiere.id_filiere}
                        onClick={() => setSelectedFiliere(filiere)}
                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                          selectedFiliere?.id_filiere === filiere.id_filiere
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-bold text-gray-900">{filiere.intitule}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getNiveauBadgeColor(filiere.niveau)}`}>
                            {filiere.niveau}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {DOCUMENT_TYPES_BY_LEVEL[filiere.niveau]?.length || 0} documents requis
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Centres */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Centres d'examen et de dépôt</h2>
                <p className="text-gray-600">Choisissez vos centres de dépôt de dossier et d'examen</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Centre de Dépôt <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCentreDepot}
                  onChange={(e) => setSelectedCentreDepot(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un centre de dépôt</option>
                  {centresDepot.map(centre => (
                    <option key={centre.id_centre} value={centre.id_centre}>
                      {centre.nom_centre} - {centre.ville}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Centre d'Examen <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCentreExam}
                  onChange={(e) => setSelectedCentreExam(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Sélectionner un centre d'examen</option>
                  {centresExam.map(centre => (
                    <option key={centre.id_centre} value={centre.id_centre}>
                      {centre.nom_centre} - {centre.ville}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Documents */}
          {step === 3 && selectedFiliere && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Documents requis</h2>
                <p className="text-gray-600">
                  Téléchargez les {DOCUMENT_TYPES_BY_LEVEL[selectedFiliere.niveau]?.length} documents requis pour {selectedFiliere.niveau}
                </p>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Important</p>
                  <p>Tous les documents marqués d'un astérisque (*) sont obligatoires. Formats acceptés: PDF, JPG, PNG (max 5MB par fichier)</p>
                </div>
              </div>

              <div className="space-y-4">
                {DOCUMENT_TYPES_BY_LEVEL[selectedFiliere.niveau]?.map((docType) => (
                  <div key={docType.name} className="border-2 border-gray-200 rounded-xl p-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {docType.description} {docType.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileChange(docType.name, e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {documents[docType.name] && (
                      <p className="text-sm text-green-600 mt-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        {documents[docType.name].name}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Paiement */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reçu de paiement</h2>
                <p className="text-gray-600">
                  Téléchargez votre reçu de paiement. Notre système OCR extraira automatiquement les informations.
                </p>
              </div>

              <PaymentReceiptUpload 
                onFileSelect={handlePaymentReceiptSelect}
                required={true}
              />

              {paymentData && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <h3 className="font-bold text-green-900 mb-2">✓ Informations vérifiées</h3>
                  <p className="text-sm text-green-700">
                    Les informations de paiement ont été extraites avec succès. Vérifiez-les à l'étape suivante.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 5: Vérification */}
          {step === 5 && selectedFiliere && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification</h2>
                <p className="text-gray-600">Vérifiez vos informations avant de soumettre</p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Filière sélectionnée</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{selectedFiliere.intitule}</p>
                      <p className="text-sm text-gray-600">{ecole?.nom_ecole}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getNiveauBadgeColor(selectedFiliere.niveau)}`}>
                      {selectedFiliere.niveau}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Centres</h3>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-semibold">Dépôt:</span>{' '}
                      {centresDepot.find(c => c.id_centre.toString() === selectedCentreDepot)?.nom_centre}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Examen:</span>{' '}
                      {centresExam.find(c => c.id_centre.toString() === selectedCentreExam)?.nom_centre}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Documents ({Object.keys(documents).length})</h3>
                  <div className="space-y-1">
                    {Object.entries(documents).map(([key, file]) => (
                      <p key={key} className="text-sm flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {file.name}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-bold text-gray-900 mb-3">Paiement</h3>
                  {paymentReceipt && (
                    <div className="space-y-2">
                      <p className="text-sm flex items-center text-green-600">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Reçu: {paymentReceipt.name}
                      </p>
                      {paymentData && (
                        <div className="mt-3 space-y-1 text-sm">
                          {paymentData.montant && (
                            <p><span className="font-semibold">Montant:</span> {paymentData.montant} FCFA</p>
                          )}
                          {paymentData.reference && (
                            <p><span className="font-semibold">Référence:</span> {paymentData.reference}</p>
                          )}
                          {paymentData.date && (
                            <p><span className="font-semibold">Date:</span> {paymentData.date}</p>
                          )}
                          {paymentData.banque && (
                            <p><span className="font-semibold">Banque:</span> {paymentData.banque}</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Validation automatique</p>
                  <p>Votre candidature sera automatiquement validée après soumission. Vous recevrez un email de confirmation.</p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {step > 1 && (
              <button
                onClick={prevStep}
                className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Précédent
              </button>
            )}
            
            {step < 5 ? (
              <button
                onClick={nextStep}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all ml-auto"
              >
                Suivant
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all ml-auto disabled:opacity-50"
              >
                {loading ? 'Envoi en cours...' : 'Soumettre l\'inscription'}
                <CheckCircle className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default EnrollmentFormNew
