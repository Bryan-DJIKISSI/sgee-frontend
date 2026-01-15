import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, Search, BookOpen, Calendar } from 'lucide-react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { concoursService, type Concours } from '../../services/concoursService'
import { ecoleService } from '../../services/ecoleService'

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle?: string
}

const AdminConcours = () => {
  const [concours, setConcours] = useState<Concours[]>([])
  const [ecoles, setEcoles] = useState<Ecole[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingConcours, setEditingConcours] = useState<Concours | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    intitule: '',
    description: '',
    date_debut: '',
    date_fin: '',
    date_limite_inscription: '',
    date_limite_paiement: '',
    date_limite_depot: '',
    id_ecole: '',
    niveau_requis: '',
    frais_inscription: '',
    places_disponibles: '',
    statut: 'ouvert',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [ecolesRes, concoursRes] = await Promise.all([
        ecoleService.getAll(),
        concoursService.getAll()
      ])
      
      setEcoles(ecolesRes.data || [])
      setConcours(concoursRes.data || [])
    } catch (error) {
      console.error('Erreur chargement:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingConcours) {
        await concoursService.update(editingConcours.id_concours, formData)
        toast.success('Concours modifié avec succès')
      } else {
        await concoursService.create(formData)
        toast.success('Concours créé avec succès')
      }

      setShowModal(false)
      resetForm()
      loadData()
    } catch (error: any) {
      console.error('Erreur:', error)
      toast.error(error.response?.data?.message || 'Erreur lors de l\'opération')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (c: Concours) => {
    setEditingConcours(c)
    setFormData({
      intitule: c.intitule,
      description: c.description || '',
      date_debut: c.date_debut,
      date_fin: c.date_fin,
      date_limite_inscription: c.date_limite_inscription,
      date_limite_paiement: c.date_limite_paiement,
      date_limite_depot: c.date_limite_depot,
      id_ecole: c.id_ecole.toString(),
      niveau_requis: c.niveau_requis,
      frais_inscription: c.frais_inscription.toString(),
      places_disponibles: c.places_disponibles.toString(),
      statut: c.statut,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce concours ?')) return

    try {
      await concoursService.delete(id)
      toast.success('Concours supprimé avec succès')
      loadData()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const resetForm = () => {
    setFormData({
      intitule: '',
      description: '',
      date_debut: '',
      date_fin: '',
      date_limite_inscription: '',
      date_limite_paiement: '',
      date_limite_depot: '',
      id_ecole: '',
      niveau_requis: '',
      frais_inscription: '',
      places_disponibles: '',
      statut: 'ouvert',
    })
    setEditingConcours(null)
  }

  const filteredConcours = concours.filter(c =>
    c.intitule.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestion des Concours</h1>
            <p className="text-gray-600 mt-1">Créez et gérez les concours nationaux</p>
          </div>
          <button
            onClick={() => {
              resetForm()
              setShowModal(true)
            }}
            className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Ajouter un concours
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-md p-4 border border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un concours..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Concours List */}
        <div className="grid gap-6">
          {filteredConcours.map((c) => (
            <div
              key={c.id_concours}
              className="bg-white rounded-xl shadow-md p-6 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <BookOpen className="h-6 w-6 text-primary-600" />
                    <h3 className="text-xl font-bold text-gray-900">{c.intitule}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      c.statut === 'ouvert' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {c.statut}
                    </span>
                  </div>
                  <p className="text-gray-600">{c.ecole?.nom_ecole}</p>
                  {c.description && (
                    <p className="text-sm text-gray-600 mt-2">{c.description}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-4">
                <div className="text-sm">
                  <p className="text-gray-600">Date du concours</p>
                  <p className="font-semibold">{new Date(c.date_debut).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Inscription avant</p>
                  <p className="font-semibold">{new Date(c.date_limite_inscription).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Places</p>
                  <p className="font-semibold">{c.places_disponibles}</p>
                </div>
                <div className="text-sm">
                  <p className="text-gray-600">Frais</p>
                  <p className="font-semibold">{c.frais_inscription.toLocaleString()} FCFA</p>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(c.id_concours)}
                  className="inline-flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredConcours.length === 0 && !loading && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun concours</h3>
            <p className="text-gray-600">Commencez par ajouter un concours</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingConcours ? 'Modifier le concours' : 'Ajouter un concours'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Informations générales */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Informations générales</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Intitulé du concours *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.intitule}
                      onChange={(e) => setFormData({ ...formData, intitule: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: Concours ENSP Cycle Ingénieur 2026"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      École *
                    </label>
                    <select
                      required
                      value={formData.id_ecole}
                      onChange={(e) => setFormData({ ...formData, id_ecole: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="">Sélectionner une école</option>
                      {ecoles.map((ecole) => (
                        <option key={ecole.id_ecole} value={ecole.id_ecole}>
                          {ecole.nom_ecole}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Statut *
                    </label>
                    <select
                      required
                      value={formData.statut}
                      onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="ouvert">Ouvert</option>
                      <option value="fermé">Fermé</option>
                      <option value="bientôt">Bientôt</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Dates importantes</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date début concours *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_debut}
                      onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date fin concours *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_fin}
                      onChange={(e) => setFormData({ ...formData, date_fin: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date limite inscription *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_limite_inscription}
                      onChange={(e) => setFormData({ ...formData, date_limite_inscription: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date limite paiement *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_limite_paiement}
                      onChange={(e) => setFormData({ ...formData, date_limite_paiement: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Date limite dépôt dossier *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.date_limite_depot}
                      onChange={(e) => setFormData({ ...formData, date_limite_depot: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Détails */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Détails du concours</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Niveau requis *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.niveau_requis}
                      onChange={(e) => setFormData({ ...formData, niveau_requis: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Ex: Baccalauréat série C, D"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Frais d'inscription (FCFA) *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.frais_inscription}
                      onChange={(e) => setFormData({ ...formData, frais_inscription: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Places disponibles *
                    </label>
                    <input
                      type="number"
                      required
                      value={formData.places_disponibles}
                      onChange={(e) => setFormData({ ...formData, places_disponibles: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
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
                  {loading ? 'Enregistrement...' : editingConcours ? 'Modifier' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

export default AdminConcours
