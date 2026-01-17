import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { Plus, Edit, Trash2, BookOpen, Search, X, Save, Building2 } from 'lucide-react'

interface Departement {
  id_departement: number
  intitule: string
  description?: string
  code_depart: string
  id_ecole?: number
  ecole?: {
    nom_ecole: string
  }
}

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
}

const DepartementManagement = () => {
  const [departements, setDepartements] = useState<Departement[]>([])
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingDept, setEditingDept] = useState<Departement | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    intitule: '',
    description: '',
    code_depart: '',
    id_ecole: ''
  })

  useEffect(() => {
    loadDepartements()
    loadEcoles()
  }, [])

  const loadDepartements = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/departements`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setDepartements(data.data || [])
      } else {
        setDepartements(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des départements')
    } finally {
      setLoading(false)
    }
  }

  const loadEcoles = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ecoles`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setEcoles(data.data || [])
      }
    } catch (error) {
      console.error('Erreur chargement écoles:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    
    try {
      const url = editingDept 
        ? `${import.meta.env.VITE_API_URL}/departements/${editingDept.id_departement}`
        : `${import.meta.env.VITE_API_URL}/departements`
      
      const response = await fetch(url, {
        method: editingDept ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || (editingDept ? 'Département modifié' : 'Département créé'))
        loadDepartements()
        closeModal()
      } else {
        const errorMsg = data.errors ? Object.values(data.errors).flat().join(', ') : data.message || 'Erreur'
        toast.error(errorMsg)
      }
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer ce département ?')) return

    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/departements/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Département supprimé')
      loadDepartements()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const openModal = (dept?: Departement) => {
    if (dept) {
      setEditingDept(dept)
      setFormData({
        intitule: dept.intitule,
        description: dept.description || '',
        code_depart: dept.code_depart,
        id_ecole: dept.id_ecole?.toString() || ''
      })
    } else {
      setEditingDept(null)
      setFormData({ intitule: '', description: '', code_depart: '', id_ecole: '' })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingDept(null)
  }

  const filteredDepts = departements.filter(dept =>
    dept.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.code_depart.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Départements</h1>
            <p className="text-gray-600 mt-1">Gérez les départements des écoles</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouveau Département
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Département</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">École</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredDepts.map((dept) => (
                <tr key={dept.id_departement} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-primary-600 mr-3" />
                      <div>
                        <p className="font-semibold text-gray-900">{dept.intitule}</p>
                        {dept.description && (
                          <p className="text-sm text-gray-600">{dept.description}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                      {dept.code_depart}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {dept.ecole ? (
                      <div className="flex items-center">
                        <Building2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{dept.ecole.nom_ecole}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(dept)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(dept.id_departement)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-2xl font-bold">{editingDept ? 'Modifier' : 'Nouveau'} Département</h2>
              <button onClick={closeModal}><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Nom <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.intitule}
                  onChange={(e) => setFormData({...formData, intitule: e.target.value})}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code_depart}
                  onChange={(e) => setFormData({...formData, code_depart: e.target.value})}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">École</label>
                <select
                  value={formData.id_ecole}
                  onChange={(e) => setFormData({...formData, id_ecole: e.target.value})}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                >
                  <option value="">Sélectionner une école</option>
                  {ecoles.map(e => (
                    <option key={e.id_ecole} value={e.id_ecole}>{e.nom_ecole}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-3 border-2 rounded-xl"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 bg-gray-100 rounded-xl">
                  Annuler
                </button>
                <button type="submit" className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-xl">
                  <Save className="h-5 w-5 inline mr-2" />
                  {editingDept ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default DepartementManagement
