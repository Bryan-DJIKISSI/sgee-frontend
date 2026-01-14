import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ecoleService } from '../services/ecoleService'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { BookOpen, MapPin, ArrowRight } from 'lucide-react'

const EcolesList = () => {
  const [ecoles, setEcoles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEcoles()
  }, [])

  const loadEcoles = async () => {
    try {
      const response = await ecoleService.getAll()
      setEcoles(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement des écoles')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Écoles disponibles</h1>
          <p className="text-gray-600">
            Sélectionnez une école pour commencer votre inscription au concours
          </p>
        </div>

        {ecoles.length === 0 ? (
          <div className="card text-center py-12">
            <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune école disponible
            </h3>
            <p className="text-gray-600">
              Les écoles seront bientôt disponibles pour l'inscription
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecoles.map((ecole) => (
              <div key={ecole.id_ecole} className="card hover:shadow-lg transition-shadow">
                {ecole.logo_path && (
                  <div className="mb-4">
                    <img
                      src={`http://localhost:8000/storage/${ecole.logo_path}`}
                      alt={ecole.nom_ecole}
                      className="h-20 w-20 object-contain mx-auto"
                    />
                  </div>
                )}
                
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {ecole.nom_ecole}
                </h3>
                
                {ecole.sigle && (
                  <p className="text-sm text-primary-600 font-medium mb-2">
                    {ecole.sigle}
                  </p>
                )}
                
                {ecole.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {ecole.description}
                  </p>
                )}
                
                {ecole.ville && (
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <MapPin className="h-4 w-4 mr-1" />
                    {ecole.ville}
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span>{ecole.departements?.length || 0} départements</span>
                    <span>{ecole.concours?.length || 0} concours</span>
                  </div>
                  
                  <Link
                    to={`/enrollment/${ecole.id_ecole}`}
                    className="btn-primary w-full flex items-center justify-center"
                  >
                    S'inscrire
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default EcolesList
