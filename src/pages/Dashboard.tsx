import { Link } from 'react-router-dom'
import { BookOpen, FileText, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  const stats = [
    { label: 'Inscriptions', value: '0', icon: FileText, color: 'from-primary-500 to-primary-600', bgColor: 'bg-primary-50' },
    { label: 'En attente', value: '0', icon: Clock, color: 'from-accent-500 to-accent-600', bgColor: 'bg-accent-50' },
    { label: 'Validées', value: '0', icon: CheckCircle, color: 'from-secondary-500 to-secondary-600', bgColor: 'bg-secondary-50' },
  ]

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-secondary-600 to-teal-600 rounded-2xl shadow-2xl p-8 md:p-12">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-48 h-48 bg-white opacity-5 rounded-full"></div>
          <div className="relative">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <span className="px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white">
                Candidat
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Bienvenue, {user?.name} {user?.surname} ! 👋
            </h1>
            <p className="text-xl text-white/90 max-w-2xl">
              Gérez vos inscriptions aux concours nationaux et suivez votre progression en temps réel
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="h-7 w-7 text-primary-600" />
                </div>
                <div className={`px-3 py-1 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <span className="text-xs font-semibold text-white">+0%</span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/concours"
            className="group bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div className="text-white/80 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Concours disponibles</h3>
            <p className="text-white/80">Consulter les concours ouverts</p>
          </Link>

          <Link
            to="/my-enrollments"
            className="group bg-gradient-to-br from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 transform hover:-translate-y-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div className="text-white/80 group-hover:translate-x-1 transition-transform">
                →
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Mes inscriptions</h3>
            <p className="text-white/80">Voir et gérer mes dossiers</p>
          </Link>

          <div className="group bg-gradient-to-br from-accent-500 to-accent-600 rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Calendar className="h-7 w-7 text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Calendrier</h3>
            <p className="text-white/80">Dates importantes des concours</p>
          </div>
        </div>

        {/* Info Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Informations importantes</h3>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Assurez-vous d'avoir tous vos documents avant de commencer</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Le justificatif de paiement doit être clair et lisible</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Vérifiez les dates limites d'inscription</span>
              </li>
              <li className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5 flex-shrink-0" />
                <span className="text-gray-700">Conservez votre reçu pour le jour de l'examen</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl shadow-lg p-8 border border-primary-100">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Prochaines étapes</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Choisir une école</p>
                  <p className="text-sm text-gray-600">Parcourir les écoles disponibles</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Remplir le formulaire</p>
                  <p className="text-sm text-gray-600">Compléter votre dossier</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
                <div>
                  <p className="font-semibold text-gray-900">Recevoir le reçu</p>
                  <p className="text-sm text-gray-600">Télécharger votre reçu</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
