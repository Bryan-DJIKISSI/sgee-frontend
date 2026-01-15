import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { 
  School, Calendar, FileText, Users, TrendingUp, 
  CheckCircle, Clock, XCircle, Activity 
} from 'lucide-react'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { enrollmentService } from '../../services/enrollmentService'
import { ecoleService } from '../../services/ecoleService'

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEcoles: 0,
    totalEnrollments: 0,
    pendingEnrollments: 0,
    validatedEnrollments: 0,
    rejectedEnrollments: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const [ecolesResponse, enrollmentsResponse] = await Promise.all([
        ecoleService.getAll(),
        enrollmentService.getAll()
      ])

      if (ecolesResponse.success && ecolesResponse.data) {
        const enrollments = enrollmentsResponse.data || []
        setStats({
          totalEcoles: ecolesResponse.data.length,
          totalEnrollments: enrollments.length,
          pendingEnrollments: enrollments.filter((e: any) => e.statut === 'en_attente').length,
          validatedEnrollments: enrollments.filter((e: any) => e.statut === 'validé').length,
          rejectedEnrollments: enrollments.filter((e: any) => e.statut === 'rejeté').length
        })
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des statistiques')
    } finally {
      setLoading(false)
    }
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
        <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-primary-600 to-secondary-600 rounded-2xl shadow-2xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Activity className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Tableau de bord Admin</h1>
            <p className="text-xl text-white/90">
              Vue d'ensemble du système de gestion des inscriptions
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Enrollments */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEnrollments}</h3>
            <p className="text-sm text-gray-600 font-medium">Total Inscriptions</p>
          </div>

          {/* Pending */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-1 rounded-lg">
                En attente
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingEnrollments}</h3>
            <p className="text-sm text-gray-600 font-medium">À valider</p>
          </div>

          {/* Validated */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                Validé
              </span>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.validatedEnrollments}</h3>
            <p className="text-sm text-gray-600 font-medium">Validées</p>
          </div>

          {/* Ecoles */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <School className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalEcoles}</h3>
            <p className="text-sm text-gray-600 font-medium">Écoles actives</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions rapides</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              to="/admin/ecoles"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 group"
            >
              <div className="text-center">
                <div className="inline-flex p-4 bg-primary-100 rounded-2xl group-hover:bg-primary-200 transition-colors mb-4">
                  <School className="h-8 w-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gérer les écoles</h3>
                <p className="text-sm text-gray-600">Ajouter, modifier ou supprimer des écoles</p>
              </div>
            </Link>

            <Link
              to="/admin/concours"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 group"
            >
              <div className="text-center">
                <div className="inline-flex p-4 bg-green-100 rounded-2xl group-hover:bg-green-200 transition-colors mb-4">
                  <Calendar className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gérer les concours</h3>
                <p className="text-sm text-gray-600">Planifier et publier les concours</p>
              </div>
            </Link>

            <Link
              to="/admin/enrollments"
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 group"
            >
              <div className="text-center">
                <div className="inline-flex p-4 bg-orange-100 rounded-2xl group-hover:bg-orange-200 transition-colors mb-4">
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Valider les inscriptions</h3>
                <p className="text-sm text-gray-600">Examiner et valider les dossiers</p>
              </div>
            </Link>

            <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-6 border border-gray-100 group cursor-pointer">
              <div className="text-center">
                <div className="inline-flex p-4 bg-purple-100 rounded-2xl group-hover:bg-purple-200 transition-colors mb-4">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Gérer les utilisateurs</h3>
                <p className="text-sm text-gray-600">Administrer les comptes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Activité récente</h2>
          
          {stats.pendingEnrollments > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl">
                <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {stats.pendingEnrollments} inscription{stats.pendingEnrollments > 1 ? 's' : ''} en attente
                  </p>
                  <p className="text-sm text-gray-600">
                    Des dossiers nécessitent votre validation
                  </p>
                </div>
                <Link
                  to="/admin/enrollments"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-all"
                >
                  Voir
                </Link>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">
                    {stats.validatedEnrollments} inscription{stats.validatedEnrollments > 1 ? 's' : ''} validée{stats.validatedEnrollments > 1 ? 's' : ''}
                  </p>
                  <p className="text-sm text-gray-600">
                    Dossiers approuvés avec succès
                  </p>
                </div>
              </div>

              {stats.rejectedEnrollments > 0 && (
                <div className="flex items-center space-x-4 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
                  <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <XCircle className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {stats.rejectedEnrollments} inscription{stats.rejectedEnrollments > 1 ? 's' : ''} rejetée{stats.rejectedEnrollments > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-gray-600">
                      Dossiers non conformes
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Aucune activité récente</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
