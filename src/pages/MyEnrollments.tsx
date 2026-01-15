import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { enrollmentService } from '../services/enrollmentService'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { FileText, Download, Clock, CheckCircle, XCircle, Calendar, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Enrollement {
  id_enrollement: number
  date_enrollement: string
  date_limite_inscription: string
  statut?: string
  annee_academique: string
  qr_code?: string
  created_at?: string
}

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Enrollement[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('tous')

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentService.getMyEnrollments()
      if (response.success && response.data) {
        setEnrollments(response.data)
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des inscriptions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (statut?: string) => {
    const badges = {
      'en_attente': { 
        color: 'bg-amber-100 text-amber-800 border-amber-200', 
        icon: Clock, 
        text: 'En attente',
        gradient: 'from-amber-500 to-orange-500'
      },
      'validé': { 
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200', 
        icon: CheckCircle, 
        text: 'Validé',
        gradient: 'from-emerald-500 to-teal-500'
      },
      'rejeté': { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: XCircle, 
        text: 'Rejeté',
        gradient: 'from-red-500 to-pink-500'
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
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-secondary-600 to-teal-600 rounded-2xl shadow-2xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Mes Inscriptions</h1>
            <p className="text-xl text-white/90">
              Consultez et suivez l'état de vos inscriptions aux concours
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center space-x-4">
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
                Tous ({enrollments.length})
              </button>
              <button
                onClick={() => setFilter('en_attente')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === 'en_attente'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                En attente ({enrollments.filter(e => e.statut === 'en_attente').length})
              </button>
              <button
                onClick={() => setFilter('validé')}
                className={`px-6 py-2 rounded-xl font-medium transition-all ${
                  filter === 'validé'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Validés ({enrollments.filter(e => e.statut === 'validé').length})
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
              {filter === 'tous' ? 'Aucune inscription' : `Aucune inscription ${filter}`}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filter === 'tous' 
                ? "Vous n'avez pas encore d'inscription. Commencez par choisir une école."
                : `Vous n'avez pas d'inscription avec le statut "${filter}".`
              }
            </p>
            {filter === 'tous' && (
              <a 
                href="/ecoles" 
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5"
              >
                Commencer une inscription
              </a>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredEnrollments.map((enrollment) => (
              <div 
                key={enrollment.id_enrollement} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100 group"
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
                        <p className="text-gray-600">Année académique {enrollment.annee_academique}</p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Date d'inscription</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(enrollment.date_enrollement), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <Clock className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Date limite</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {format(new Date(enrollment.date_limite_inscription), 'dd MMMM yyyy', { locale: fr })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {enrollment.qr_code && (
                      <div className="mt-4 flex items-center space-x-2 text-sm">
                        <CheckCircle className="h-5 w-5 text-emerald-600" />
                        <span className="text-emerald-700 font-semibold">QR Code généré</span>
                      </div>
                    )}
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end space-y-4">
                    {getStatusBadge(enrollment.statut)}
                    
                    {enrollment.statut === 'validé' && enrollment.qr_code && (
                      <button className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5">
                        <Download className="h-5 w-5 mr-2" />
                        Télécharger le reçu
                      </button>
                    )}

                    {enrollment.statut === 'en_attente' && (
                      <div className="flex items-start space-x-2 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl max-w-xs">
                        <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                          Votre dossier est en cours de vérification. Vous serez notifié par email.
                        </p>
                      </div>
                    )}

                    {enrollment.statut === 'rejeté' && (
                      <div className="flex items-start space-x-2 p-4 bg-red-50 border-2 border-red-200 rounded-xl max-w-xs">
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-red-800">
                          Votre dossier a été rejeté. Contactez l'administration pour plus d'informations.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Box */}
        {enrollments.length > 0 && (
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-2xl p-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Informations importantes</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Conservez votre reçu d'inscription pour le jour de l'examen</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Vérifiez régulièrement votre email pour les notifications</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>En cas de problème, contactez le support avant la date limite</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MyEnrollments
