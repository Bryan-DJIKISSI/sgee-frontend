import Layout from '../components/Layout'
import { BookOpen } from 'lucide-react'

const EcolesList = () => {
  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Écoles disponibles</h1>
          <p className="text-gray-600">
            Sélectionnez une école pour commencer votre inscription au concours
          </p>
        </div>

        <div className="card text-center py-12">
          <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Page en cours de développement
          </h3>
          <p className="text-gray-600">
            Les écoles seront bientôt disponibles
          </p>
        </div>
      </div>
    </Layout>
  )
}

export default EcolesList
