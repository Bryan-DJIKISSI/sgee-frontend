import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, School } from 'lucide-react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { ecoleService } from '../../services/ecoleService'

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
  adresse?: string
  ville?: string
  telephone?: string
  email?: string
  logo_path?: string
  description?: string
}

const AdminEcoles = () => {
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingEcole, setEditingEcole] = useState<Ecole | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    nom_ecole: '',
    sigle: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    description: '',
    latitude: '',
    longitude: '',
  })
  const [logoFile, setLogoFile] = useState<File | null>(null)

  useEffect(() => {
    loadEcoles()
  }, [])

  const loadEcoles = async () => {
    try {
      const response = await ecoleService.getAll()
      setEcoles(response.data || [])
    } catch (error) {
      console.error('Erreur chargement écoles:', error)
      toast.error('Erreur lors du chargement des écoles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key as keyof typeof formData])
      })
      
      if (logoFile) {
        data.append('logo', logoFile)
      }

      if (editingEcole) {
        await ecoleService.update(editingEcole.id_ecole, data)
        toast.success('École modifiée avec succès')
      } else {
        await ecoleService.create(data)
        toast.success('École créée avec succès')
      }

      setShowModal(false)
      resetForm()
      loadEcoles()
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (ecole: Ecole) => {
    setEditingEcole(ecole)
    setFormData({
      nom_ecole: ecole.nom_ecole,
      sigle: ecole.sigle || '',
      adresse: ecole.adresse || '',
      ville: ecole.ville || '',
      telephone: ecole.telephone || '',
      email: ecole.email || '',
      description: ecole.description || '',
      latitude: (ecole as any).latitude || '',
      longitude: (ecole as any).longitude || '',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette école ?')) return

    try {
      await ecoleService.delete(id)
      toast.success('École supprimée avec succès')
      loadEcoles()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      nom_ecole: '',
      sigle: '',
      adresse: '',
      ville: '',
      telephone: '',
      email: '',
      description: '',
      latitude: '',
      longitude: '',
    })
    setLogoFile(null)
    setEditingEcole(null)
  }

  const filteredEcoles = ecoles.filter(ecole =>
    ecole.nom_ecole.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ecole.sigle?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Écoles</h1>
            <p className="text-gray-600 mt-1">Gérez les écoles et établissements</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter une école
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher une école..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Ecoles List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEcoles.map((ecole) => (
            <div
              key={ecole.id_ecole}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {ecole.logo_path ? (
                    <img
                      src={`http://localhost:8000/storage/${ecole.logo_path}`}
                      alt={ecole.nom_ecole}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <School className="h-6 w-6 text-primary-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{ecole.nom_ecole}</h3>
                    {ecole.sigle && (
                      <p className="text-sm text-gray-600">{ecole.sigle}</p>
                    )}
                  </div>
                </div>
              </div>

              {ecole.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {ecole.description}
                </p>
              )}

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {ecole.ville && (
                  <p>📍 {ecole.ville}</p>
                )}
                {ecole.telephone && (
                  <p>📞 {ecole.telephone}</p>
                )}
                {ecole.email && (
                  <p>✉️ {ecole.email}</p>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(ecole)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(ecole.id_ecole)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredEcoles.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <School className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucune école</h3>
            <p className="text-gray-600">Commencez par ajouter une école</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingEcole ? 'Modifier l\'école' : 'Ajouter une école'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom de l'école *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nom_ecole}
                    onChange={(e) => setFormData({ ...formData, nom_ecole: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Sigle
                  </label>
                  <input
                    type="text"
                    value={formData.sigle}
                    onChange={(e) => setFormData({ ...formData, sigle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Logo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Adresse
                </label>
                <input
                  type="text"
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: 3.8480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: 11.5021"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : editingEcole ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminEcoles
