import Layout from '../components/Layout'
import { FileText } from 'lucide-react'

const MyEnrollments = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes inscriptions</h1>
          <p className="text-gray-600">
            Consultez l'état de vos inscriptions aux concours
          </p>
        </div>

        <div className="card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucune inscription
          </h3>
          <p className="text-gray-600 mb-4">
            Vous n'avez pas encore d'inscription
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default MyEnrollments
