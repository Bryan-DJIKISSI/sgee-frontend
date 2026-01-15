import { Link } from 'react-router-dom'
import { School, Calendar, FileText, Users } from 'lucide-react'
import Layout from '../../components/Layout'

const AdminDashboard = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-600 to-primary-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">Tableau de bord Admin</h1>
          <p className="text-purple-100">
            Gérez les écoles, concours et inscriptions
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/admin/ecoles"
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="text-center">
              <div className="inline-flex p-4 bg-primary-100 rounded-full group-hover:bg-primary-200 transition-colors mb-4">
                <School className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Écoles</h3>
              <p className="text-sm text-gray-600">Gérer les écoles</p>
            </div>
          </Link>

          <Link
            to="/admin/concours"
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="text-center">
              <div className="inline-flex p-4 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors mb-4">
                <Calendar className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Concours</h3>
              <p className="text-sm text-gray-600">Gérer les concours</p>
            </div>
          </Link>

          <Link
            to="/admin/enrollments"
            className="card hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="text-center">
              <div className="inline-flex p-4 bg-orange-100 rounded-full group-hover:bg-orange-200 transition-colors mb-4">
                <FileText className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Inscriptions</h3>
              <p className="text-sm text-gray-600">Valider les dossiers</p>
            </div>
          </Link>

          <div className="card">
            <div className="text-center">
              <div className="inline-flex p-4 bg-purple-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Utilisateurs</h3>
              <p className="text-sm text-gray-600">Gérer les comptes</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default AdminDashboard
