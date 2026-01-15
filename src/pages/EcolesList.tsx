import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ecoleService } from '../services/ecoleService'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { School, MapPin, BookOpen, ArrowRight, Search, Building2 } from 'lucide-react'

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
  description?: string
  adresse?: string
  ville?: string
  logo_path?: string
  actif: boolean
}

const EcolesList = () => {
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    loadEcoles()
  }, [])

  const loadEcoles = async () => {
    try {
      const response = await ecoleService.getAll()
      if (response.success && response.data) {
        setEcoles(response.data.filter(e => e.actif))
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des écoles')
    } finally {
      setLoading(false)
    }
  }

  const filteredEcoles = ecoles.filter(ecole =>
    ecole.nom_ecole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ecole.sigle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ecole.ville?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleSelectEcole = (id: number) => {
    navigate(`/enrollment?ecole=${id}`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-secondary-600 to-teal-600 rounded-2xl shadow-2xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <School className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Écoles Disponibles</h1>
            <p className="text-xl text-white/90">
              Sélectionnez une école pour commencer votre inscription au concours
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une école par nom, sigle ou ville..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {filteredEcoles.length} école{filteredEcoles.length > 1 ? 's' : ''} trouvée{filteredEcoles.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Ecoles Grid */}
        {filteredEcoles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
              <School className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {searchTerm ? 'Aucune école trouvée' : 'Aucune école disponible'}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchTerm 
                ? 'Essayez de modifier votre recherche ou de parcourir toutes les écoles.'
                : 'Les écoles seront bientôt disponibles pour les inscriptions.'
              }
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEcoles.map((ecole) => (
              <div
                key={ecole.id_ecole}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 group cursor-pointer"
                onClick={() => handleSelectEcole(ecole.id_ecole)}
              >
                {/* Logo */}
                <div className="mb-6">
                  {ecole.logo_path ? (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-2xl flex items-center justify-center overflow-hidden">
                      <img 
                        src={`${import.meta.env.VITE_API_URL}/storage/${ecole.logo_path}`} 
                        alt={ecole.nom_ecole}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Building2 className="h-10 w-10 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                      {ecole.nom_ecole}
                    </h3>
                    {ecole.sigle && (
                      <p className="text-sm font-semibold text-primary-600">
                        {ecole.sigle}
                      </p>
                    )}
                  </div>

                  {ecole.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {ecole.description}
                    </p>
                  )}

                  {(ecole.adresse || ecole.ville) && (
                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
                      <span>
                        {ecole.adresse && `${ecole.adresse}, `}
                        {ecole.ville}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <button className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform group-hover:-translate-y-0.5">
                    <BookOpen className="h-5 w-5 mr-2" />
                    S'inscrire
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Avant de vous inscrire</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Assurez-vous d'avoir tous les documents requis (CNI, diplômes, etc.)</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Préparez votre justificatif de paiement (reçu bancaire)</span>
                </li>
                <li className="flex items-start">
                  <ArrowRight className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Vérifiez les dates limites d'inscription pour chaque concours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default EcolesList
