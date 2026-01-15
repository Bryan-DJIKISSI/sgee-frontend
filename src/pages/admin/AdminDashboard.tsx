import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Users, 
  School, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle,
  TrendingUp,
  Calendar,
  BookOpen,
  Settings
} from 'lucide-react'
import AdminLayout from '../../components/AdminLayout'

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCandidats: 0,
    totalEcoles: 0,
    totalConcours: 0,
    enrollementsEnAttente: 0,
    enrollementsValides: 0,
    enrollementsRejetes: 0,
  })

  useEffect(() => {
    // TODO: Charger les statistiques depuis l'API
    setStats({
      totalCandidats: 1250,
      totalEcoles: 15,
      totalConcours: 8,
      enrollementsEnAttente: 45,
      enrollementsValides: 892,
      enrollementsRejetes: 23,
    })
  }, [])

  const statCards = [
    {
      title: 'Total Candidats',
      value: stats.totalCandidats,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
    },
    {
      title: 'Écoles',
      value: stats.totalEcoles,
      icon: School,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
    },
    {
      title: 'Concours Actifs',
      value: stats.totalConcours,
      icon: FileText,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600',
    },
    {
      title: 'En Attente',
      value: stats.enrollementsEnAttente,
      icon: Clock,
      color: 'bg-amber-500',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
    },
    {
      title: 'Validés',
      value: stats.enrollementsValides,
      icon: CheckCircle,
      color: 'bg-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
    },
    {
      title: 'Rejetés',
      value: stats.enrollementsRejetes,
      icon: XCircle,
      color: 'bg-red-500',
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
    },
  ]

  const quickActions = [
    {
      title: 'Gérer les Écoles',
      description: 'Ajouter, modifier ou supprimer des écoles',
      icon: School,
      link: '/admin/ecoles',
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Gérer les Concours',
      description: 'Créer et gérer les concours nationaux',
      icon: BookOpen,
      link: '/admin/concours',
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Valider les Inscriptions',
      description: 'Vérifier et valider les enrollements',
      icon: CheckCircle,
      link: '/admin/enrollments',
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Paramètres',
      description: 'Configuration du système',
      icon: Settings,
      link: '/admin/settings',
      color: 'from-gray-500 to-gray-600',
    },
  ]

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-secondary-600 rounded-2xl p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Tableau de Bord Administrateur</h1>
          <p className="text-primary-100">
            Bienvenue dans l'interface d'administration du SGEE
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-4 rounded-xl`}>
                    <Icon className={`h-8 w-8 ${stat.textColor}`} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Actions Rapides</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Link
                  key={index}
                  to={action.link}
                  className="group bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:-translate-y-1"
                >
                  <div className={`bg-gradient-to-br ${action.color} w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{action.title}</h3>
                  <p className="text-sm text-gray-600">{action.description}</p>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Activité Récente</h2>
            <Link to="/admin/enrollments" className="text-primary-600 hover:text-primary-700 font-semibold text-sm">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Nouvelle inscription</p>
                    <p className="text-sm text-gray-600">Jean Dupont - ENSP Yaoundé</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">Il y a 5 min</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
