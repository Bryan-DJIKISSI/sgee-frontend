import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { Plus, Edit, Trash2, GraduationCap, Search, X, Save, BookOpen } from 'lucide-react'

interface Filiere {
  id_filiere: number
  intitule: string
  code_filiere: string
  niveau: string
  duree_ans: number
  id_departement?: number
  departement?: {
    intitule: string
    ecole?: {
      nom_ecole: string
    }
  }
}

interface Departement {
  id_departement: number
  intitule: string
  ecole?: {
    nom_ecole: string
  }
}

const FiliereManagement = () => {
  const [filieres, setFilieres] = useState<Filiere[]>([])
  const [departements, setDepartements] = useState<Departement[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingFiliere, setEditingFiliere] = useState<Filiere | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    intitule: '',
    code_filiere: '',
    niveau: 'L1',
    duree_ans: '3',
    id_departement: ''
  })

  useEffect(() => {
    loadFilieres()
    loadDepartements()
  }, [])

  const loadFilieres = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/filieres`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (data.success) {
        setFilieres(data.data || [])
      } else {
        setFilieres(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des filières')
    } finally {
      setLoading(false)
    }
  }

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
      console.error('Erreur chargement départements:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const token = localStorage.getItem('token')
    
    try {
      const url = editingFiliere 
        ? `${import.meta.env.VITE_API_URL}/filieres/${editingFiliere.id_filiere}`
        : `${import.meta.env.VITE_API_URL}/filieres`
      
      const response = await fetch(url, {
        method: editingFiliere ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          duree_ans: parseInt(formData.duree_ans)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        toast.success(data.message || (editingFiliere ? 'Filière modifiée' : 'Filière créée'))
        loadFilieres()
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
    if (!confirm('Supprimer cette filière ?')) return

    try {
      const token = localStorage.getItem('token')
      await fetch(`${import.meta.env.VITE_API_URL}/filieres/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      toast.success('Filière supprimée')
      loadFilieres()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const openModal = (filiere?: Filiere) => {
    if (filiere) {
      setEditingFiliere(filiere)
      setFormData({
        intitule: filiere.intitule,
        code_filiere: filiere.code_filiere,
        niveau: filiere.niveau,
        duree_ans: filiere.duree_ans.toString(),
        id_departement: filiere.id_departement?.toString() || ''
      })
    } else {
      setEditingFiliere(null)
      setFormData({
        intitule: '',
        code_filiere: '',
        niveau: 'L1',
        duree_ans: '3',
        id_departement: ''
      })
    }
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingFiliere(null)
  }

  const filteredFilieres = filieres.filter(fil =>
    fil.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fil.code_filiere.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fil.niveau.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getNiveauBadgeColor = (niveau: string) => {
    const colors: { [key: string]: string } = {
      'L1': 'bg-blue-100 text-blue-700',
      'L2': 'bg-green-100 text-green-700',
      'L3': 'bg-yellow-100 text-yellow-700',
      'Master': 'bg-purple-100 text-purple-700',
      'Doctorat': 'bg-red-100 text-red-700'
    }
    return colors[niveau] || 'bg-gray-100 text-gray-700'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Filières</h1>
            <p className="text-gray-600 mt-1">Gérez les filières des départements</p>
          </div>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nouvelle Filière
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une filière..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFilieres.map((filiere) => (
            <div key={filiere.id_filiere} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center">
                    <GraduationCap className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{filiere.intitule}</h3>
                    <p className="text-sm text-gray-600">{filiere.code_filiere}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Niveau</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getNiveauBadgeColor(filiere.niveau)}`}>
                    {filiere.niveau}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Durée</span>
                  <span className="text-sm font-semibold text-gray-900">{filiere.duree_ans} ans</span>
                </div>
              </div>

              {filiere.departement && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-sm">
                    <BookOpen className="h-4 w-4 text-gray-400 mr-2" />
                    <div>
                      <p className="font-semibold text-gray-900">{filiere.departement.intitule}</p>
                      {filiere.departement.ecole && (
                        <p className="text-xs text-gray-600">{filiere.departement.ecole.nom_ecole}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openModal(filiere)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(filiere.id_filiere)}
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredFilieres.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <GraduationCap className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune filière trouvée</h3>
            <p className="text-gray-600">
              {searchTerm ? 'Aucune filière ne correspond à votre recherche' : 'Commencez par créer une filière'}
            </p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingFiliere ? 'Modifier la filière' : 'Nouvelle filière'}
              </h2>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom de la filière <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.intitule}
                  onChange={(e) => setFormData({...formData, intitule: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: Génie Logiciel"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code_filiere}
                  onChange={(e) => setFormData({...formData, code_filiere: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: GL"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Niveau <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={formData.niveau}
                    onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="L1">Licence 1</option>
                    <option value="L2">Licence 2</option>
                    <option value="L3">Licence 3</option>
                    <option value="Master">Master</option>
                    <option value="Doctorat">Doctorat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Durée (ans) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="10"
                    value={formData.duree_ans}
                    onChange={(e) => setFormData({...formData, duree_ans: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Département <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={formData.id_departement}
                  onChange={(e) => setFormData({...formData, id_departement: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Sélectionner un département</option>
                  {departements.map(dept => (
                    <option key={dept.id_departement} value={dept.id_departement}>
                      {dept.intitule} {dept.ecole && `(${dept.ecole.nom_ecole})`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingFiliere ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default FiliereManagement
