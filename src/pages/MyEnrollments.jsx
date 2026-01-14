import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { enrollmentService } from '../services/enrollmentService'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { FileText, Download, Clock, CheckCircle, XCircle } from 'lucide-react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

const MyEnrollments = () => {
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEnrollments()
  }, [])

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentService.getMyEnrollments()
      setEnrollments(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des inscriptions')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (statut) => {
    const badges = {
      'en_attente': { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'En attente' },
      'validé': { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Validé' },
      'rejeté': { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Rejeté' },
    }
    const badge = badges[statut] || badges['en_attente']
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <Icon className="h-4 w-4 mr-1" />
        {badge.text}
      </span>
    )
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes inscriptions</h1>
          <p className="text-gray-600">
            Consultez l'état de vos inscriptions aux concours
          </p>
        </div>

        {enrollments.length === 0 ? (
          <div className="card text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune inscription
            </h3>
            <p className="text-gray-600 mb-4">
              Vous n'avez pas encore d'inscription
            </p>
            <a href="/ecoles" className="btn-primary inline-block">
              Commencer une inscription
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => (
              <div key={enrollment.id_enrollement} className="card hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Inscription #{enrollment.id_enrollement}
                      </h3>
                      {getStatusBadge(enrollment.statut)}
                    </div>
                    
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {format(new Date(enrollment.date_enrollement), 'dd MMMM yyyy', { locale: fr })}
                      </p>
                      <p>
                        <span className="font-medium">Année académique:</span>{' '}
                        {enrollment.annee_academique}
                      </p>
                      {enrollment.qr_code && (
                        <p className="text-green-600 font-medium">
                          ✓ QR Code généré
                        </p>
                      )}
                    </div>
                  </div>

                  {enrollment.statut === 'validé' && enrollment.qr_code && (
                    <div className="mt-4 md:mt-0">
                      <button className="btn-primary flex items-center">
                        <Download className="h-4 w-4 mr-2" />
                        Télécharger le reçu
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default MyEnrollments
