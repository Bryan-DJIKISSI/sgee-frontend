import { useState } from 'react'
import Layout from '../../components/Layout'
import { 
  Calendar, Plus, Edit, Trash2, Upload, 
  CheckCircle, XCircle, FileText, School 
} from 'lucide-react'

interface Concours {
  id_concours: number
  intitule: string
  date_debut: string
  date_fin: string
  id_ecole?: number
  pdf_path?: string
  ecole?: {
    nom_ecole: string
    sigle?: string
  }
}

const AdminConcours = () => {
  const [concours] = useState<Concours[]>([
    {
      id_concours: 1,
      intitule: 'Concours d\'entrée en 1ère année',
      date_debut: '2026-03-01',
      date_fin: '2026-03-15',
      id_ecole: 1,
      ecole: {
        nom_ecole: 'École Nationale Supérieure Polytechnique',
        sigle: 'ENSP'
      }
    },
    {
      id_concours: 2,
      intitule: 'Concours Master 2',
      date_debut: '2026-04-01',
      date_fin: '2026-04-10',
      id_ecole: 2,
      ecole: {
        nom_ecole: 'École Normale Supérieure',
        sigle: 'ENS'
      }
    }
  ])

  const isActive = (dateDebut: string, dateFin: string) => {
    const now = new Date()
    const debut = new Date(dateDebut)
    const fin = new Date(dateFin)
    return now >= debut && now <= fin
  }

  const isUpcoming = (dateDebut: string) => {
    const now = new Date()
    const debut = new Date(dateDebut)
    return now < debut
  }

  const isPast = (dateFin: string) => {
    const now = new Date()
    const fin = new Date(dateFin)
    return now > fin
  }

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header */}
        <div className="relative overflow-hidden bg-gradient-to-r from-green-600 via-primary-600 to-secondary-600 rounded-2xl shadow-2xl p-8">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-64 h-64 bg-white opacity-5 rounded-full"></div>
          <div className="relative flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">Gestion des concours</h1>
              <p className="text-xl text-white/90">
                Planifiez et publiez les concours d'entrée
              </p>
            </div>
            <button className="inline-flex items-center px-6 py-3 bg-white hover:bg-gray-100 text-primary-600 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-5 w-5 mr-2" />
              Nouveau concours
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{concours.length}</h3>
                <p className="text-sm text-gray-600">Total concours</p>
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
                  {concours.filter(c => isActive(c.date_debut, c.date_fin)).length}
                </h3>
                <p className="text-sm text-gray-600">En cours</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {concours.filter(c => isUpcoming(c.date_debut)).length}
                </h3>
                <p className="text-sm text-gray-600">À venir</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                <XCircle className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {concours.filter(c => isPast(c.date_fin)).length}
                </h3>
                <p className="text-sm text-gray-600">Terminés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Concours List */}
        <div className="grid gap-6">
          {concours.map((c) => {
            const active = isActive(c.date_debut, c.date_fin)
            const upcoming = isUpcoming(c.date_debut)
            const past = isPast(c.date_fin)

            return (
              <div 
                key={c.id_concours} 
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8 border border-gray-100"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left Section */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg">
                        <Calendar className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{c.intitule}</h3>
                        {c.ecole && (
                          <p className="text-gray-600">
                            {c.ecole.nom_ecole} {c.ecole.sigle && `(${c.ecole.sigle})`}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Date de début</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(c.date_debut).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                        <Calendar className="h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-xs text-gray-600 font-medium">Date de fin</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {new Date(c.date_fin).toLocaleDateString('fr-FR', { 
                              day: 'numeric', 
                              month: 'long', 
                              year: 'numeric' 
                            })}
                          </p>
                        </div>
                      </div>
                    </div>

                    {c.pdf_path && (
                      <div className="mt-4 flex items-center space-x-2 text-sm">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <span className="text-primary-700 font-semibold">Document PDF disponible</span>
                      </div>
                    )}
                  </div>

                  {/* Right Section */}
                  <div className="flex flex-col items-end space-y-4">
                    {/* Status Badge */}
                    {active && (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border-2 bg-emerald-100 text-emerald-800 border-emerald-200">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        En cours
                      </span>
                    )}
                    {upcoming && (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border-2 bg-amber-100 text-amber-800 border-amber-200">
                        <Calendar className="h-4 w-4 mr-2" />
                        À venir
                      </span>
                    )}
                    {past && (
                      <span className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border-2 bg-gray-100 text-gray-800 border-gray-200">
                        <XCircle className="h-4 w-4 mr-2" />
                        Terminé
                      </span>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-6 py-3 bg-primary-100 hover:bg-primary-200 text-primary-700 font-semibold rounded-xl transition-all">
                        <Edit className="h-5 w-5 mr-2" />
                        Modifier
                      </button>
                      <button className="inline-flex items-center px-4 py-3 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-xl transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>

                    {!c.pdf_path && (
                      <button className="inline-flex items-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-all">
                        <Upload className="h-5 w-5 mr-2" />
                        Ajouter PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Info Box */}
        <div className="bg-gradient-to-br from-primary-50 to-secondary-50 border-2 border-primary-200 rounded-2xl p-6">
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <School className="h-6 w-6 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">Gestion des concours</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Définissez les dates d'ouverture et de clôture des inscriptions</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Associez chaque concours à une école spécifique</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-4 w-4 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span>Téléchargez le calendrier des concours en PDF pour les candidats</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminConcours
