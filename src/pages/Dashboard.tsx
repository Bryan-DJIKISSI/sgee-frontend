import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen, FileText, Calendar, TrendingUp, CheckCircle, Clock, AlertCircle, Building2 } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'
import { ecoleService } from '../services/ecoleService'
import { statsService } from '../services/statsService'
import { toast } from 'react-toastify'

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
  logo_path?: string
  ville?: string
}

interface CandidatStats {
  totalInscriptions: number
  enAttente: number
  valides: number
  rejetes: number
}

const Dashboard = () => {
  const { user } = useAuth()
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [loadingEcoles, setLoadingEcoles] = useState(true)
  const [stats, setStats] = useState<CandidatStats>({
    totalInscriptions: 0,
    enAttente: 0,
    valides: 0,
    rejetes: 0,
  })
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    loadEcoles()
    loadStats()
  }, [])

  const loadEcoles = async () => {
    try {
      const response = await ecoleService.getAll()
      if (response.success && response.data) {
        setEcoles(response.data.slice(0, 6)) // Afficher les 6 premières écoles
      }
    } catch (error) {
      console.error('Erreur chargement écoles:', error)
      toast.error('Erreur lors du chargement des écoles')
    } finally {
      setLoadingEcoles(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await statsService.getCandidatStats()
      setStats(data)
    } catch (error) {
      console.error('Erreur chargement statistiques:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const statCards = [
    { label: 'Inscriptions', value: stats.totalInscriptions, icon: FileText, color: 'from-primary-500 to-primary-600', bgColor: 'bg-primary-50' },
    { label: 'En attente', value: stats.enAttente, icon: Clock, color: 'from-accent-500 to-accent-600', bgColor: 'bg-accent-50' },
    { label: 'Validées', value: stats.valides, icon: CheckCircle, color: 'from-secondary-500 to-secondary-600', bgColor: 'bg-secondary-50' },
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
          {statCards.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                  <stat.icon className="h-7 w-7 text-primary-600" />
                </div>
                <div className={`px-3 py-1 bg-gradient-to-r ${stat.color} rounded-lg`}>
                  <span className="text-xs font-semibold text-white">
                    {loadingStats ? '...' : '+0%'}
                  </span>
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">
                {loadingStats ? (
                  <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                ) : (
                  stat.value
                )}
              </h3>
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

        {/* Écoles disponibles */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Écoles disponibles</h2>
              <p className="text-gray-600">Choisissez une école pour voir les concours</p>
            </div>
            <Link
              to="/concours"
              className="text-primary-600 hover:text-primary-700 font-semibold text-sm flex items-center"
            >
              Voir tous les concours →
            </Link>
          </div>

          {loadingEcoles ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : ecoles.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ecoles.map((ecole) => (
                <Link
                  key={ecole.id_ecole}
                  to="/concours"
                  className="group bg-gradient-to-br from-gray-50 to-white border-2 border-gray-100 hover:border-primary-300 rounded-xl p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    {ecole.logo_path ? (
                      <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center overflow-hidden border-2 border-gray-100 group-hover:border-primary-300 transition-all">
                        <img 
                          src={`${import.meta.env.VITE_BASE_URL}/storage/${ecole.logo_path}`}
                          alt={ecole.nom_ecole}
                          className="w-12 h-12 object-contain"
                          onError={(e) => {
                            const target = e.currentTarget
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              const icon = document.createElement('div')
                              icon.className = 'w-full h-full flex items-center justify-center'
                              icon.innerHTML = '<svg class="h-8 w-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>'
                              parent.appendChild(icon)
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center border-2 border-primary-200 group-hover:border-primary-300 transition-all">
                        <Building2 className="h-8 w-8 text-primary-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
                        {ecole.nom_ecole}
                      </h3>
                      {ecole.sigle && (
                        <p className="text-sm text-gray-600">{ecole.sigle}</p>
                      )}
                    </div>
                  </div>
                  {ecole.ville && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {ecole.ville}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune école disponible pour le moment</p>
            </div>
          )}
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
