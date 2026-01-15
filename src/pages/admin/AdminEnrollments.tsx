import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { enrollmentService } from '../../services/enrollmentService'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { 
  FileText, CheckCircle, XCircle, Clock, Eye, 
  Download, AlertCircle, Filter, User 
} from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Enrollement {
  id_enrollement: number
  date_enrollement: string
  date_limite_inscription: string
  statut?: string
  annee_academique: string
  qr_code?: string
  candidat?: {
    matricule: string
    nom?: string
    prenom?: string
  }
  created_at?: string
}

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')
  const [processingId, setProcessingId] = useState<number | null>(null)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentService.getAll()
      if (response.success && response.data) {
        setEnrollments(response.data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des inscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir valider cette inscription ?')) return

    setProcessingId(id)
    try {
      const response = await enrollmentService.validatePayment(id)
      if (response.success) {
        toast.success('Inscription validée avec succès')
        loadEnrollments()
      }
    } catch (error) {
      toast.error('Erreur lors de la validation')
    } finally {
      setProcessingId(null)
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt('Raison du rejet :')
    if (!reason) return

    setProcessingId(id)
    try {
      const response = await enrollmentService.reject(id, reason)
      if (response.success) {
        toast.success('Inscription rejetée')
        loadEnrollments()
      }
    } catch (error) {
      toast.error('Erreur lors du rejet')
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (statut?: string) => {
    const badges = {
      'en_attente': { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: Clock, 
        text: 'En attente'
      },
      'validé': { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: CheckCircle, 
        text: 'Validé'
      },
      'rejeté': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle, 
        text: 'Rejeté'
      },
    }
    const badge = badges[statut as keyof typeof badges] || badges['en_attente']
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border-2 ${badge.color}`}>
        <Icon className="h-4 w-4 mr-2" />
        {badge.text}
      </span>
    )
  }

  const filteredEnrollments = enrollments.filter(e => {
    if (filter === 'tous') return true
    return e.statut === filter
  })

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
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-primary-600 to-secondary-600 rounded-2xl shadow-2xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Gestion des inscriptions</h1>
            <p className="text-xl text-white/90">
              Validez ou rejetez les dossiers d'inscription
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{enrollments.length}</h3>
                <p className="text-sm text-gray-600">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {enrollments.filter(e => e.statut === 'en_attente').length}
                </h3>
                <p className="text-sm text-gray-600">En attente</p>
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
                  {enrollments.filter(e => e.statut === 'validé').length}
                </h3>
                <p className="text-sm text-gray-600">Validées</p>
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
                  {enrollments.filter(e => e.statut === 'rejeté').length}
                </h3>
                <p className="text-sm text-gray-600">Rejetées</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">Filtrer par statut :</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilter('tous')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === 'tous'
                    ? 'bg-gradient-to-r from-primary-600 to-secondary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setFilter('en_attente')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === 'en_attente'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente
              </button>
              <button
                onClick={() => setFilter('validé')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === 'validé'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Validées
              </button>
              <button
                onClick={() => setFilter('rejeté')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === 'rejeté'
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Rejetées
              </button>
            </div>
          </div>
        </div>

        {/* Enrollments List */}
        {filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-2xl mb-6">
              <FileText className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Aucune inscription {filter !== 'tous' && filter}
            </h3>
            <p className="text-gray-600">
              {filter === 'tous' 
                ? "Aucune inscription n'a été enregistrée pour le moment."
                : `Aucune inscription avec le statut "${filter}".`
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEnrollments.map((enrollment) => (
              <div 
                key={enrollment.id_enrollement} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <FileText className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Inscription #{enrollment.id_enrollement}
                        </h3>
                        <p className="text-gray-600">Année {enrollment.annee_academique}</p>
                      </div>
                    </div>

                    {enrollment.candidat && (
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl mb-4">
                        <User className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Candidat</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {enrollment.candidat.nom} {enrollment.candidat.prenom}
                          </p>
                          <p className="text-xs text-gray-600">
                            Matricule: {enrollment.candidat.matricule}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <Clock className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Date d'inscription</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(enrollment.date_enrollement), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <AlertCircle className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Date limite</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(enrollment.date_limite_inscription), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end space-y-4">
                    {getStatusBadge(enrollment.statut)}
                    
                    {enrollment.statut === 'en_attente' && (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleValidate(enrollment.id_enrollement)}
                          disabled={processingId === enrollment.id_enrollement}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          {processingId === enrollment.id_enrollement ? (
                            <>
                              <LoadingSpinner size="sm" />
                              <span className="ml-2">Traitement...</span>
                            </>
                          ) : (
                            <CheckCircle className="h-5 w-5 mr-2" />
                          )}
                          Valider
                        </button>
                        <button
                          onClick={() => handleReject(enrollment.id_enrollement)}
                          disabled={processingId === enrollment.id_enrollement}
                          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                        >
                          <XCircle className="h-5 w-5 mr-2" />
                          Rejeter
                        </button>
                      </div>
                    )}

                    <button className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all">
                      <Eye className="h-5 w-5 mr-2" />
                      Voir détails
                    </button>

                    {enrollment.statut === 'validé' && enrollment.qr_code && (
                      <button className="inline-flex items-center px-6 py-3 bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold rounded-xl transition-all">
                        <Download className="h-5 w-5 mr-2" />
                        Télécharger reçu
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminEnrollments
