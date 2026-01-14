import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { ecoleService } from '../../services/ecoleService'
import Layout from '../../components/Layout'
import LoadingSpinner from '../../components/LoadingSpinner'
import { Plus, Edit, Trash2, School } from 'lucide-react'

const AdminEcoles = () => {
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

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) return

    try {
      await ecoleService.delete(id)
      toast.success('École supprimée avec succès')
      loadEcoles()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
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
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des écoles</h1>
          <button className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            Ajouter une école
          </button>
        </div>

        {ecoles.length === 0 ? (
          <div className="card text-center py-12">
            <School className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune école
            </h3>
            <p className="text-gray-600">Commencez par ajouter une école</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ecoles.map((ecole) => (
              <div key={ecole.id_ecole} className="card">
                {ecole.logo_path && (
                  <img
                    src={`http://localhost:8000/storage/${ecole.logo_path}`}
                    alt={ecole.nom_ecole}
                    className="h-16 w-16 object-contain mx-auto mb-4"
                  />
                )}
                
                <h3 className="text-lg font-bold text-gray-900 text-center mb-2">
                  {ecole.nom_ecole}
                </h3>
                
                {ecole.sigle && (
                  <p className="text-sm text-primary-600 text-center mb-4">
                    {ecole.sigle}
                  </p>
                )}
                
                <div className="flex justify-center space-x-2 mt-4">
                  <button className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg">
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(ecole.id_ecole)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

export default AdminEcoles
