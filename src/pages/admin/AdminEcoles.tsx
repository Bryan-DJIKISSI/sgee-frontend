import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { ecoleService } from '../../services/ecoleService'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  School, Plus, Edit, Trash2, Building2, MapPin, 
  CheckCircle, XCircle, Search 
} from 'lucide-react'

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

const AdminEcoles = () => {
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadEcoles()
  }, [])

  const loadEcoles = async () => {
    try {
      const response = await ecoleService.getAll()
      if (response.success && response.data) {
        setEcoles(response.data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des écoles')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) return

    try {
      const response = await ecoleService.delete(id)
      if (response.success) {
        toast.success('École supprimée avec succès')
        loadEcoles()
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const filteredEcoles = ecoles.filter(ecole =>
    ecole.nom_ecole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ecole.sigle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <School className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Gestion des écoles</h1>
              <p className="text-xl text-white/90">
                Administrez les établissements et leurs informations
              </p>
            </div>
            <button
              onClick={() => toast.info('Fonctionnalité en cours de développement')}
              className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle école
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une école..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            />
          </div>
          <p className="mt-3 text-sm text-gray-600">
            {filteredEcoles.length} école{filteredEcoles.length > 1 ? 's' : ''} trouvée{filteredEcoles.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Ecoles List */}
        {filteredEcoles.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
              <School className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Aucune école trouvée</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm 
                ? 'Essayez de modifier votre recherche.'
                : 'Commencez par ajouter votre première école.'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => toast.info('Fonctionnalité en cours de développement')}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une école
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEcoles.map((ecole) => (
              <div
                key={ecole.id_ecole}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100"
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
                <div className="space-y-3 mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
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

                  {/* Status Badge */}
                  <div>
                    {ecole.actif ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-800">
                        <XCircle className="h-3 w-3 mr-1" />
                        Inactive
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 pt-6 border-t border-gray-100">
                  <button
                    onClick={() => toast.info('Fonctionnalité en cours de développement')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold rounded-xl transition-all"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(ecole.id_ecole)}
                    className="inline-flex items-center justify-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <School className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{ecoles.length}</h3>
                <p className="text-sm text-gray-600">Total écoles</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {ecoles.filter(e => e.actif).length}
                </h3>
                <p className="text-sm text-gray-600">Écoles actives</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {ecoles.filter(e => !e.actif).length}
                </h3>
                <p className="text-sm text-gray-600">Écoles inactives</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminEcoles
