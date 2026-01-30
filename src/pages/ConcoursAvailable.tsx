import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Calendar, 
  MapPin, 
  Users, 
  FileText, 
  Clock,
  School,
  ArrowRight,
  Filter
} from 'lucide-react'
import DashboardLayout from '../components/DashboardLayout'
import { concoursService, type Concours } from '../services/concoursService'
import { toast } from 'react-toastify'

const ConcoursAvailable = () => {
  const [concours, setConcours] = useState<Concours[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')

  useEffect(() => {
    loadConcours()
  }, [])

  const loadConcours = async () => {
    try {
      console.log('🔄 Chargement des concours...')
      const response = await concoursService.getAvailable()
      console.log('✅ Réponse API:', response)
      console.log('📊 Nombre de concours:', response.data?.length || 0)
      setConcours(response.data || [])
    } catch (error) {
      console.error('❌ Erreur chargement concours:', error)
      toast.error('Erreur lors du chargement des concours')
    } finally {
      setLoading(false)
    }
  }

  const isInscriptionOpen = (concours: Concours) => {
    const now = new Date()
    const dateLimite = new Date(concours.date_limite_inscription)
    return now <= dateLimite && concours.statut === 'ouvert'
  }

  const getDaysRemaining = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Concours Disponibles</h1>
          <p className="text-primary-100">
            Consultez les concours ouverts et inscrivez-vous en ligne
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <div className="flex space-x-2">
              {['tous', 'ouvert', 'bientôt', 'clôturé'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === f
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Concours List */}
        <div className="grid gap-6">
          {concours.map((c) => {
            const daysRemaining = getDaysRemaining(c.date_limite_inscription)
            const inscriptionOpen = isInscriptionOpen(c)

            return (
              <div
                key={c.id_concours}
                className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <School className="h-6 w-6 text-primary-600" />
                        <h3 className="text-xl font-bold text-gray-900">{c.intitule}</h3>
                      </div>
                      <p className="text-gray-600 mb-2">{c.ecole?.nom_ecole || 'École non spécifiée'}</p>
                      {c.description && (
                        <p className="text-sm text-gray-600">{c.description}</p>
                      )}
                    </div>
                    <div className={`px-4 py-2 rounded-full text-sm font-semibold ${
                      inscriptionOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {inscriptionOpen ? 'Ouvert' : 'Fermé'}
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-sm">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Date du concours</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(c.date_debut).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Inscription avant</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(c.date_limite_inscription).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Places disponibles</p>
                        <p className="font-semibold text-gray-900">{c.places_disponibles}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 text-sm">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-gray-600">Frais</p>
                        <p className="font-semibold text-gray-900">{c.frais_inscription.toLocaleString()} FCFA</p>
                      </div>
                    </div>
                  </div>

                  {/* Dates importantes */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-amber-900 mb-2">Dates importantes</h4>
                    <div className="grid md:grid-cols-3 gap-3 text-sm">
                      <div>
                        <p className="text-amber-700">Paiement avant</p>
                        <p className="font-semibold text-amber-900">
                          {new Date(c.date_limite_paiement).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-amber-700">Dépôt dossier avant</p>
                        <p className="font-semibold text-amber-900">
                          {new Date(c.date_limite_depot).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div>
                        <p className="text-amber-700">Niveau requis</p>
                        <p className="font-semibold text-amber-900">{c.niveau_requis}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  {inscriptionOpen && c.id_ecole ? (
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-gray-600">Plus que </span>
                        <span className="font-bold text-primary-600">{daysRemaining} jours</span>
                        <span className="text-gray-600"> pour s'inscrire</span>
                      </div>
                      <Link
                        to={`/enrollment/${c.id_ecole}?concours=${c.id_concours}`}
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                      >
                        S'inscrire maintenant
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                    </div>
                  ) : inscriptionOpen && !c.id_ecole ? (
                    <div className="text-center py-3 bg-amber-100 rounded-lg">
                      <p className="text-amber-700 font-medium">École non configurée - Contactez l'administration</p>
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-gray-100 rounded-lg">
                      <p className="text-gray-600 font-medium">Inscriptions fermées</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {concours.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun concours disponible</h3>
            <p className="text-gray-600">
              Les concours seront publiés prochainement. Revenez plus tard.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default ConcoursAvailable
