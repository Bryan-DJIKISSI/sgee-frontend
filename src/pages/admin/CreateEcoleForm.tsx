import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, Building2, Globe, Upload, Info } from 'lucide-react'
import { ecoleService } from '../../services/ecoleService'
import AdminLayout from '../../components/AdminLayout'

const CreateEcoleForm = () => {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    // Informations de base
    nom_ecole: '',
    sigle: '',
    description: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    site_web: '',
    bp: '',
    actif: true,
    
    // Informations officielles FR
    republique_fr: 'RÉPUBLIQUE DU CAMEROUN',
    devise_fr: 'Paix – Travail – Patrie',
    ministere_fr: '',
    universite_fr: '',
    slogan_fr: '',
    
    // Informations officielles EN
    republique_en: 'REPUBLIC OF CAMEROON',
    devise_en: 'Peace – Work – Fatherland',
    ministere_en: '',
    universite_en: '',
    slogan_en: '',
  })

  const [logoEcole, setLogoEcole] = useState<File | null>(null)
  const [logoUniversite, setLogoUniversite] = useState<File | null>(null)
  const [previewLogoEcole, setPreviewLogoEcole] = useState<string>('')
  const [previewLogoUniversite, setPreviewLogoUniversite] = useState<string>('')

  const steps = [
    { number: 1, title: 'Informations de base', icon: Building2 },
    { number: 2, title: 'Informations officielles (FR)', icon: Info },
    { number: 3, title: 'Informations officielles (EN)', icon: Globe },
    { number: 4, title: 'Logos et finalisation', icon: Upload },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleLogoEcoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoEcole(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewLogoEcole(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleLogoUniversiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoUniversite(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewLogoUniversite(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError('')

      const data = new FormData()
      
      // Ajouter tous les champs
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          // Convertir boolean en 0 ou 1 pour Laravel
          if (typeof value === 'boolean') {
            data.append(key, value ? '1' : '0')
          } else {
            data.append(key, value.toString())
          }
        }
      })

      // Ajouter les logos
      if (logoEcole) {
        data.append('logo', logoEcole)
      }
      if (logoUniversite) {
        data.append('logo_universite', logoUniversite)
      }

      await ecoleService.create(data)
      navigate('/admin/ecoles')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la création de l\'école')
      console.error('Erreur détaillée:', err.response?.data)
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/ecoles')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Créer une nouvelle école</h1>
          <p className="text-gray-600 mt-2">Remplissez les informations en plusieurs étapes</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      currentStep >= step.number
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <step.icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs mt-2 text-center font-medium">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? 'bg-primary-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          {/* Step 1: Informations de base */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations de base</h2>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom de l'école *
                  </label>
                  <input
                    type="text"
                    name="nom_ecole"
                    value={formData.nom_ecole}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sigle
                  </label>
                  <input
                    type="text"
                    name="sigle"
                    value={formData.sigle}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse
                  </label>
                  <input
                    type="text"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="ville"
                    value={formData.ville}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Boîte Postale (BP)
                  </label>
                  <input
                    type="text"
                    name="bp"
                    value={formData.bp}
                    onChange={handleInputChange}
                    placeholder="BP. 22 AMBAM"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    placeholder="(+237) 222 482 412"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Site Web
                  </label>
                  <input
                    type="url"
                    name="site_web"
                    value={formData.site_web}
                    onChange={handleInputChange}
                    placeholder="www.example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Informations officielles FR */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations officielles (Français)</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  République
                </label>
                <input
                  type="text"
                  name="republique_fr"
                  value={formData.republique_fr}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Devise
                </label>
                <input
                  type="text"
                  name="devise_fr"
                  value={formData.devise_fr}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'Université
                </label>
                <input
                  type="text"
                  name="universite_fr"
                  value={formData.universite_fr}
                  onChange={handleInputChange}
                  placeholder="UNIVERSITÉ D'EBOLOWA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom complet de l'école (pour l'en-tête)
                </label>
                <textarea
                  name="ministere_fr"
                  value={formData.ministere_fr}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="ÉCOLE SUPÉRIEURE DE TRANSPORT, DE LOGISTIQUE ET DE COMMERCE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  name="slogan_fr"
                  value={formData.slogan_fr}
                  onChange={handleInputChange}
                  placeholder="Excellence et Innovation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Informations officielles EN */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Informations officielles (Anglais)</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Republic
                </label>
                <input
                  type="text"
                  name="republique_en"
                  value={formData.republique_en}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motto
                </label>
                <input
                  type="text"
                  name="devise_en"
                  value={formData.devise_en}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University Name
                </label>
                <input
                  type="text"
                  name="universite_en"
                  value={formData.universite_en}
                  onChange={handleInputChange}
                  placeholder="THE UNIVERSITY OF EBOLOWA"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full School Name (for header)
                </label>
                <textarea
                  name="ministere_en"
                  value={formData.ministere_en}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="HIGHER INSTITUTE OF TRANSPORT, LOGISTICS AND COMMERCE"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slogan
                </label>
                <input
                  type="text"
                  name="slogan_en"
                  value={formData.slogan_en}
                  onChange={handleInputChange}
                  placeholder="Excellence and Innovation"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Step 4: Logos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Logos et finalisation</h2>
              
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo de l'école
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {previewLogoEcole ? (
                      <div>
                        <img src={previewLogoEcole} alt="Preview" className="w-32 h-32 object-contain mx-auto mb-4" />
                        <button
                          onClick={() => {
                            setLogoEcole(null)
                            setPreviewLogoEcole('')
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoEcoleChange}
                          className="hidden"
                          id="logo-ecole"
                        />
                        <label
                          htmlFor="logo-ecole"
                          className="cursor-pointer text-primary-600 hover:text-primary-700"
                        >
                          Choisir un fichier
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Logo de l'université
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {previewLogoUniversite ? (
                      <div>
                        <img src={previewLogoUniversite} alt="Preview" className="w-32 h-32 object-contain mx-auto mb-4" />
                        <button
                          onClick={() => {
                            setLogoUniversite(null)
                            setPreviewLogoUniversite('')
                          }}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUniversiteChange}
                          className="hidden"
                          id="logo-universite"
                        />
                        <label
                          htmlFor="logo-universite"
                          className="cursor-pointer text-primary-600 hover:text-primary-700"
                        >
                          Choisir un fichier
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Aperçu de l'en-tête</h3>
                <p className="text-sm text-blue-700">
                  Les logos seront affichés sur la fiche d'inscription avec la structure suivante:
                </p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• À gauche: Informations en français</li>
                  <li>• Au centre: Logos (université + école)</li>
                  <li>• À droite: Informations en anglais</li>
                </ul>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Précédent
            </button>

            {currentStep < 4 ? (
              <button
                onClick={nextStep}
                className="flex items-center px-6 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700"
              >
                Suivant
                <ArrowRight className="h-5 w-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center px-6 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? 'Création...' : (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Créer l'école
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default CreateEcoleForm
