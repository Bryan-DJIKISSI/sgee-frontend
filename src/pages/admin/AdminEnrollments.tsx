import { useState, useEffect } from 'react'
import { Search, Eye, CheckCircle, XCircle, Download, Filter, FileText, User, Calendar, MapPin } from 'lucide-react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { enrollmentService } from '../../services/enrollmentService'

interface Enrollment {
  id_enrollement: number
  id_candidat: number
  id_ecole: number
  id_concours: number
  statut: string
  date_inscription: string
  candidat?: {
    matricule: string
    nom_pere: string
    prenom_pere?: string
  }
  user?: {
    name: string
    surname?: string
    email: string
  }
  ecole?: {
    nom_ecole: string
    sigle?: string
  }
  concours?: {
    intitule: string
    date_debut: string
  }
  region_origine?: string
  departement_origine?: string
  recu_paiement_path?: string
}

const AdminEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentService.getAll()
      setEnrollments(response.data || [])
    } catch (error) {
      console.error('Erreur chargement inscriptions:', error)
      toast.error('Erreur lors du chargement des inscriptions')
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir valider cette inscription ?')) return

    try {
      await enrollmentService.validate(id)
      toast.success('Inscription validée avec succès')
      loadEnrollments()
    } catch (error) {
      toast.error('Erreur lors de la validation')
    }
  }

  const handleReject = async (id: number) => {
    const reason = prompt('Raison du rejet (optionnel):')
    if (reason === null) return

    try {
      await enrollmentService.reject(id, reason)
      toast.success('Inscription rejetée')
      loadEnrollments()
    } catch (error) {
      toast.error('Erreur lors du rejet')
    }
  }

  const handleViewDetails = (enrollment: Enrollment) => {
    setSelectedEnrollment(enrollment)
    setShowModal(true)
  }

  const getStatusBadge = (statut: string) => {
    const styles = {
      'en_attente': 'bg-yellow-100 text-yellow-700',
      'validé': 'bg-green-100 text-green-700',
      'rejeté': 'bg-red-100 text-red-700',
    }
    
    const labels = {
      'en_attente': 'En attente',
      'validé': 'Validé',
      'rejeté': 'Rejeté',
    }

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${styles[statut as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {labels[statut as keyof typeof labels] || statut}
      </span>
    )
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = 
      enrollment.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.candidat?.matricule.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.ecole?.nom_ecole.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || enrollment.statut === filterStatus

    return matchesSearch && matchesStatus
  })

  const stats = {
    total: enrollments.length,
    en_attente: enrollments.filter(e => e.statut === 'en_attente').length,
    validé: enrollments.filter(e => e.statut === 'validé').length,
    rejeté: enrollments.filter(e => e.statut === 'rejeté').length,
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Inscriptions</h1>
            <p className="text-gray-600 mt-1">Validez ou rejetez les inscriptions des candidats</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.en_attente}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Validées</p>
                <p className="text-3xl font-bold text-green-600">{stats.validé}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rejetées</p>
                <p className="text-3xl font-bold text-red-600">{stats.rejeté}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, email, matricule ou école..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="en_attente">En attente</option>
                <option value="validé">Validé</option>
                <option value="rejeté">Rejeté</option>
              </select>
            </div>
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Candidat
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    École / Concours
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEnrollments.map((enrollment) => (
                  <tr key={enrollment.id_enrollement} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {enrollment.user?.name} {enrollment.user?.surname}
                          </p>
                          <p className="text-sm text-gray-600">{enrollment.user?.email}</p>
                          <p className="text-xs text-gray-500">Mat: {enrollment.candidat?.matricule}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{enrollment.ecole?.nom_ecole}</p>
                        <p className="text-sm text-gray-600">{enrollment.concours?.intitule}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {new Date(enrollment.date_inscription).toLocaleDateString('fr-FR')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(enrollment.statut)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(enrollment)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                        {enrollment.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleValidate(enrollment.id_enrollement)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Valider"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleReject(enrollment.id_enrollement)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Rejeter"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredEnrollments.length === 0 && !loading && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune inscription</h3>
              <p className="text-gray-600">
                {searchTerm || filterStatus !== 'all' 
                  ? 'Aucune inscription ne correspond à vos critères de recherche'
                  : 'Les inscriptions apparaîtront ici'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de détails */}
      {showModal && selectedEnrollment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Détails de l'inscription</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations candidat */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <User className="h-5 w-5 mr-2 text-primary-600" />
                  Informations du candidat
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom complet</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEnrollment.user?.name} {selectedEnrollment.user?.surname}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold text-gray-900">{selectedEnrollment.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Matricule</p>
                    <p className="font-semibold text-gray-900">{selectedEnrollment.candidat?.matricule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Origine</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEnrollment.departement_origine}, {selectedEnrollment.region_origine}
                    </p>
                  </div>
                </div>
              </div>

              {/* Informations concours */}
              <div className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary-600" />
                  Informations du concours
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">École</p>
                    <p className="font-semibold text-gray-900">{selectedEnrollment.ecole?.nom_ecole}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Concours</p>
                    <p className="font-semibold text-gray-900">{selectedEnrollment.concours?.intitule}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date du concours</p>
                    <p className="font-semibold text-gray-900">
                      {selectedEnrollment.concours?.date_debut && 
                        new Date(selectedEnrollment.concours.date_debut).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Date d'inscription</p>
                    <p className="font-semibold text-gray-900">
                      {new Date(selectedEnrollment.date_inscription).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reçu de paiement */}
              {selectedEnrollment.recu_paiement_path && (
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <Download className="h-5 w-5 mr-2 text-primary-600" />
                    Reçu de paiement
                  </h3>
                  <div className="flex items-center space-x-4">
                    <a
                      href={`${import.meta.env.VITE_BASE_URL}/storage/${selectedEnrollment.recu_paiement_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Télécharger le reçu
                    </a>
                    <a
                      href={`${import.meta.env.VITE_BASE_URL}/storage/${selectedEnrollment.recu_paiement_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Voir le reçu
                    </a>
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedEnrollment.statut === 'en_attente' && (
                <div className="flex space-x-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      handleValidate(selectedEnrollment.id_enrollement)
                      setShowModal(false)
                    }}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Valider l'inscription
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedEnrollment.id_enrollement)
                      setShowModal(false)
                    }}
                    className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors"
                  >
                    <XCircle className="h-5 w-5 mr-2" />
                    Rejeter l'inscription
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminEnrollments
