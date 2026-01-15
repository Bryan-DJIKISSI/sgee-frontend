import { Link } from 'react-router-dom'
import { BookOpen, Calendar, FileText, CheckCircle, ArrowRight, GraduationCap, Shield, Clock, Users, School, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import { useState, useEffect } from 'react'
import { concoursService, type Concours } from '../services/concoursService'
import { useAuth } from '../contexts/AuthContext'

const LandingPage = () => {
  const { user } = useAuth()
  const [concours, setConcours] = useState<Concours[]>([])
  const [loadingConcours, setLoadingConcours] = useState(true)

  useEffect(() => {
    loadConcours()
  }, [])

  const loadConcours = async () => {
    try {
      const response = await concoursService.getAvailable()
      setConcours(response.data || [])
    } catch (error) {
      console.error('Erreur chargement concours:', error)
    } finally {
      setLoadingConcours(false)
    }
  }

  const getDaysRemaining = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
    return days > 0 ? days : 0
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600/10 to-secondary-600/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-md mb-6">
              <GraduationCap className="h-5 w-5 text-primary-600 mr-2" />
              <span className="text-sm font-semibold text-gray-700">Plateforme Officielle</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Système de Gestion des
              <span className="block bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent mt-2">
                Examens et Enrôlements
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Inscrivez-vous facilement aux concours nationaux des grandes écoles du Cameroun. 
              Un processus <span className="font-semibold text-primary-600">simple, rapide et sécurisé</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 rounded-xl shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1"
              >
                Commencer l'inscription
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-primary-700 bg-white hover:bg-gray-50 rounded-xl shadow-lg hover:shadow-xl transition-all border-2 border-primary-200"
              >
                Se connecter
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">10+</div>
                <div className="text-sm text-gray-600 mt-1">Grandes Écoles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">5000+</div>
                <div className="text-sm text-gray-600 mt-1">Candidats</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">100%</div>
                <div className="text-sm text-gray-600 mt-1">Sécurisé</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Comment ça marche ?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Un processus simple et guidé en 4 étapes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: BookOpen,
                title: '1. Créez votre compte',
                description: 'Inscrivez-vous avec vos informations personnelles et validez votre email en quelques clics',
                color: 'from-primary-500 to-primary-600'
              },
              {
                icon: Calendar,
                title: '2. Choisissez votre école',
                description: 'Consultez les concours disponibles et sélectionnez l\'école qui correspond à votre projet',
                color: 'from-secondary-500 to-secondary-600'
              },
              {
                icon: FileText,
                title: '3. Complétez votre dossier',
                description: 'Remplissez le formulaire et téléchargez votre justificatif de paiement',
                color: 'from-accent-500 to-accent-600'
              },
              {
                icon: CheckCircle,
                title: '4. Recevez votre reçu',
                description: 'Téléchargez votre reçu d\'inscription avec QR code après validation',
                color: 'from-teal-500 to-teal-600'
              }
            ].map((step, index) => (
              <div key={index} className="relative group">
                <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all transform hover:-translate-y-2 border border-gray-100">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} text-white mb-6 shadow-lg`}>
                    <step.icon className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Sécurisé et Fiable',
                description: 'Vos données sont protégées avec les dernières technologies de sécurité'
              },
              {
                icon: Clock,
                title: 'Rapide et Simple',
                description: 'Inscription en moins de 10 minutes avec un processus guidé'
              },
              {
                icon: Users,
                title: 'Support Dédié',
                description: 'Une équipe disponible pour vous accompagner à chaque étape'
              }
            ].map((benefit, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 text-primary-600 mb-4">
                  <benefit.icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-primary-600 to-secondary-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Prêt à commencer votre inscription ?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Rejoignez des milliers de candidats qui nous font confiance pour leur avenir académique
          </p>
          <Link
            to="/register"
            className="inline-flex items-center px-10 py-5 text-lg font-semibold text-primary-600 bg-white hover:bg-gray-50 rounded-xl shadow-2xl hover:shadow-3xl transition-all transform hover:-translate-y-1"
          >
            Créer mon compte gratuitement
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Concours Disponibles Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Concours Ouverts
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez les concours actuellement ouverts aux inscriptions
            </p>
          </div>

          {loadingConcours ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : concours.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {concours.slice(0, 6).map((c) => {
                const daysRemaining = getDaysRemaining(c.date_limite_inscription)
                
                return (
                  <div
                    key={c.id_concours}
                    className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1"
                  >
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-600 p-6 text-white">
                      <div className="flex items-center space-x-3 mb-3">
                        <School className="h-6 w-6" />
                        <h3 className="font-bold text-lg line-clamp-1">{c.ecole?.nom_ecole}</h3>
                      </div>
                      <p className="text-sm text-white/90 line-clamp-2">{c.intitule}</p>
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-primary-600" />
                        <span>Concours: {new Date(c.date_debut).toLocaleDateString('fr-FR')}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-primary-600" />
                        <span>Inscription avant: {new Date(c.date_limite_inscription).toLocaleDateString('fr-FR')}</span>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-primary-600" />
                        <span>{c.places_disponibles} places</span>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-sm text-gray-600">Plus que</span>
                          <span className="text-2xl font-bold text-primary-600">{daysRemaining}</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-4">jours pour s'inscrire</p>

                        {user ? (
                          <Link
                            to={`/enrollment/${c.id_ecole}?concours=${c.id_concours}`}
                            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                          >
                            S'inscrire maintenant
                          </Link>
                        ) : (
                          <Link
                            to="/login"
                            className="block w-full text-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                          >
                            Se connecter pour s'inscrire
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun concours ouvert</h3>
              <p className="text-gray-600">
                Les concours seront publiés prochainement. Revenez plus tard.
              </p>
            </div>
          )}

          {concours.length > 6 && (
            <div className="text-center mt-12">
              <Link
                to={user ? "/concours" : "/login"}
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Voir tous les concours
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg">
                  <BookOpen className="h-8 w-8 text-white" />
                </div>
                <span className="text-2xl font-bold">SGEE</span>
              </div>
              <p className="text-gray-400 leading-relaxed max-w-md">
                Plateforme officielle d'inscription aux concours nationaux des grandes écoles du Cameroun. 
                Simplifiez votre parcours académique avec nous.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary-400">Liens rapides</h3>
              <ul className="space-y-3">
                <li><Link to="/register" className="text-gray-400 hover:text-white transition-colors">Inscription</Link></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Connexion</Link></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Aide</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-primary-400">Contact</h3>
              <ul className="space-y-3 text-gray-400">
                <li>Email: contact@sgee.cm</li>
                <li>Tél: +237 696 622 260</li>
                <li>Douala, Cameroun</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">© 2026 SGEE. Tous droits réservés.</p>
            <div className="mt-4">
              <Link 
                to="/login" 
                className="inline-flex items-center text-sm text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Shield className="h-4 w-4 mr-2" />
                Accès Administrateur
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
