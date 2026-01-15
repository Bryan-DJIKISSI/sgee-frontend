import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, MapPin, Building } from 'lucide-react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { centreService, type Centre } from '../../services/centreService'

const AdminCentres = () => {
  const [centres, setCentres] = useState<(Centre & { type: 'depot' | 'examen' })[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCentre, setEditingCentre] = useState<(Centre & { type: 'depot' | 'examen' }) | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'depot' | 'examen'>('all')
  const [formData, setFormData] = useState({
    nom_centre: '',
    adresse: '',
    ville: '',
    region: '',
    latitude: '',
    longitude: '',
    capacite: '',
    type: 'depot' as 'depot' | 'examen',
  })

  const regions = [
    'Adamaoua', 'Centre', 'Est', 'Extrême-Nord', 'Littoral',
    'Nord', 'Nord-Ouest', 'Ouest', 'Sud', 'Sud-Ouest'
  ]

  useEffect(() => {
    loadCentres()
  }, [])

  const loadCentres = async () => {
    try {
      const [depotsRes, examsRes] = await Promise.all([
        centreService.getDepots(),
        centreService.getExams()
      ])
      
      const depots = (depotsRes.data || []).map(c => ({ ...c, type: 'depot' as const }))
      const exams = (examsRes.data || []).map(c => ({ ...c, type: 'examen' as const }))
      
      setCentres([...depots, ...exams])
    } catch (error) {
      console.error('Erreur chargement centres:', error)
      toast.error('Erreur lors du chargement des centres')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const data = {
        nom_centre: formData.nom_centre,
        lieu_centre: formData.ville, // Using ville as lieu_centre
        adresse: formData.adresse,
        ville: formData.ville,
        region: formData.region,
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        capacite: formData.capacite ? parseInt(formData.capacite) : null,
      }

      if (editingCentre) {
        if (formData.type === 'depot') {
          await centreService.updateDepot(editingCentre.id_centre, data)
        } else {
          await centreService.updateExam(editingCentre.id_centre, data)
        }
        toast.success('Centre modifié avec succès')
      } else {
        if (formData.type === 'depot') {
          await centreService.createDepot(data)
        } else {
          await centreService.createExam(data)
        }
        toast.success('Centre créé avec succès')
      }

      setShowModal(false)
      resetForm()
      loadCentres()
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (centre: Centre & { type: 'depot' | 'examen' }) => {
    setEditingCentre(centre)
    setFormData({
      nom_centre: centre.nom_centre,
      adresse: centre.adresse || '',
      ville: centre.ville || '',
      region: centre.region || '',
      latitude: centre.latitude || '',
      longitude: centre.longitude || '',
      capacite: centre.capacite?.toString() || '',
      type: centre.type,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number, type: 'depot' | 'examen') => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce centre ?')) return

    try {
      if (type === 'depot') {
        await centreService.deleteDepot(id)
      } else {
        await centreService.deleteExam(id)
      }
      toast.success('Centre supprimé avec succès')
      loadCentres()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      nom_centre: '',
      adresse: '',
      ville: '',
      region: '',
      latitude: '',
      longitude: '',
      capacite: '',
      type: 'depot',
    })
    setEditingCentre(null)
  }

  const filteredCentres = centres.filter(centre => {
    const matchesSearch = centre.nom_centre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         centre.ville.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === 'all' || centre.type === filterType
    return matchesSearch && matchesType
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Centres</h1>
            <p className="text-gray-600 mt-1">Gérez les centres de dépôt et d'examen</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un centre
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un centre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div className="flex space-x-2">
              {['all', 'depot', 'examen'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filterType === type
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type === 'all' ? 'Tous' : type === 'depot' ? 'Dépôt' : 'Examen'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Centres List */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCentres.map((centre) => (
            <div
              key={`${centre.type}-${centre.id_centre}`}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    centre.type === 'depot' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {centre.type === 'depot' ? (
                      <Building className={`h-6 w-6 ${centre.type === 'depot' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <MapPin className="h-6 w-6 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{centre.nom_centre}</h3>
                    <p className="text-sm text-gray-600">
                      {centre.type === 'depot' ? 'Centre de Dépôt' : 'Centre d\'Examen'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4">
                {centre.ville && <p>📍 {centre.ville}</p>}
                {centre.region && <p>🗺️ {centre.region}</p>}
                {centre.adresse && <p className="text-xs">📮 {centre.adresse}</p>}
                {centre.capacite && <p>👥 Capacité: {centre.capacite}</p>}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(centre as any)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(centre.id_centre, centre.type)}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredCentres.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun centre</h3>
            <p className="text-gray-600">Commencez par ajouter un centre</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCentre ? 'Modifier le centre' : 'Ajouter un centre'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Type de centre *
                </label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'depot' | 'examen' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="depot">Centre de Dépôt</option>
                  <option value="examen">Centre d'Examen</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom du centre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom_centre}
                  onChange={(e) => setFormData({ ...formData, nom_centre: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Ville *</label>
                  <input
                    type="text"
                    required
                    value={formData.ville}
                    onChange={(e) => setFormData({ ...formData, ville: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Région *</label>
                  <select
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Sélectionner</option>
                    {regions.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adresse *</label>
                <input
                  type="text"
                  required
                  value={formData.adresse}
                  onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Latitude</label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="3.8480"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Longitude</label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="11.5021"
                  />
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {loading ? 'Enregistrement...' : editingCentre ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminCentres
