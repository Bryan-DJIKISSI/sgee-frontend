import { Link } from 'react-router-dom'
import { BookOpen, FileText, Calendar } from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()

  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Bienvenue, {user?.nom} {user?.prenom} !
          </h1>
          <p className="text-primary-100">
            Gérez vos inscriptions aux concours nationaux
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/ecoles"
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-primary-100 rounded-lg group-hover:bg-primary-200 transition-colors">
                <BookOpen className="h-8 w-8 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Écoles disponibles</h3>
                <p className="text-sm text-gray-600">Consulter les écoles</p>
              </div>
            </div>
          </Link>

          <Link
            to="/my-enrollments"
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <FileText className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Mes inscriptions</h3>
                <p className="text-sm text-gray-600">Voir mes dossiers</p>
              </div>
            </div>
          </Link>

          <div className="card">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Calendrier</h3>
                <p className="text-sm text-gray-600">Dates importantes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Dashboard
