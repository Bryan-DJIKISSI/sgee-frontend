import Layout from '../../components/Layout'
import { FileText } from 'lucide-react'

const AdminEnrollments = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Gestion des inscriptions</h1>
        
        <div className="card text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Fonctionnalité en cours de développement
          </h3>
        </div>
      </div>
    </Layout>
  )
}

export default AdminEnrollments
