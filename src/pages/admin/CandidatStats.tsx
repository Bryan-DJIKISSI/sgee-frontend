import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { 
  Users, TrendingUp, CheckCircle, Clock, XCircle, 
  Download, FileText, FileSpreadsheet, Filter, Search,
  Building2, GraduationCap, BarChart3
} from 'lucide-react'

interface GlobalStats {
  total_candidats: number
  total_enrollements: number
  valides: number
  en_attente: number
  rejetes: number
}

interface EcoleStats {
  nom_ecole: string
  total: number
}

interface FiliereStats {
  filiere: string
  niveau: string
  nom_ecole: string
  total: number
}

interface Candidat {
  id_enrollement: number
  user: {
    nom: string
    prenom: string
    email: string
    telephone?: string
  }
  filiere: {
    intitule: string
    niveau: string
    departement: {
      intitule: string
      ecole: {
        nom_ecole: string
      }
    }
  }
  centreDepot?: {
    nom_centre: string
  }
  centreExam?: {
    nom_centre: string
  }
  statut: string
  created_at: string
}

const CandidatStats = () => {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [ecoleStats, setEcoleStats] = useState<EcoleStats[]>([])
  const [filiereStats, setFiliereStats] = useState<FiliereStats[]>([])
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEcole, setSelectedEcole] = useState('')
  const [selectedFiliere, setSelectedFiliere] = useState('')
  const [selectedNiveau, setSelectedNiveau] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')

  useEffect(() => {
    loadStats()
    loadCandidats()
  }, [])

  useEffect(() => {
    loadCandidats()
  }, [selectedEcole, selectedFiliere, selectedNiveau, selectedStatut])

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/candidats/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setGlobalStats(data.data.global)
        setEcoleStats(data.data.par_ecole || [])
        setFiliereStats(data.data.par_filiere || [])
      } else {
        console.error('Erreur API:', data)
        toast.error('Erreur lors du chargement des statistiques')
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
      toast.error('Erreur lors du chargement des statistiques')
      // Initialiser avec des valeurs par défaut
      setGlobalStats({
        total_candidats: 0,
        total_enrollements: 0,
        valides: 0,
        en_attente: 0,
        rejetes: 0
      })
      setEcoleStats([])
      setFiliereStats([])
    } finally {
      setLoading(false)
    }
  }

  const loadCandidats = async () => {
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (selectedEcole) params.append('ecole_id', selectedEcole)
      if (selectedFiliere) params.append('filiere_id', selectedFiliere)
      if (selectedNiveau) params.append('niveau', selectedNiveau)
      if (selectedStatut) params.append('statut', selectedStatut)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/candidats/list?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setCandidats(data.data || [])
      } else {
        console.error('Erreur API candidats:', data)
        setCandidats([])
      }
    } catch (error) {
      console.error('Erreur chargement candidats:', error)
      setCandidats([])
    }
  }

  const exportPdf = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (selectedEcole) params.append('ecole_id', selectedEcole)
      if (selectedFiliere) params.append('filiere_id', selectedFiliere)
      if (selectedNiveau) params.append('niveau', selectedNiveau)
      if (selectedStatut) params.append('statut', selectedStatut)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/candidats/export/pdf?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidats_${new Date().toISOString().split('T')[0]}.pdf`
      a.click()
      toast.success('Export PDF réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF')
    } finally {
      setExporting(false)
    }
  }

  const exportExcel = async () => {
    setExporting(true)
    try {
      const token = localStorage.getItem('token')
      const params = new URLSearchParams()
      if (selectedEcole) params.append('ecole_id', selectedEcole)
      if (selectedFiliere) params.append('filiere_id', selectedFiliere)
      if (selectedNiveau) params.append('niveau', selectedNiveau)
      if (selectedStatut) params.append('statut', selectedStatut)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/candidats/export/excel?${params}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `candidats_${new Date().toISOString().split('T')[0]}.xlsx`
      a.click()
      toast.success('Export Excel réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel')
    } finally {
      setExporting(false)
    }
  }

  const filteredCandidats = candidats.filter(c => {
    if (!c.user) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      c.user.nom?.toLowerCase().includes(searchLower) ||
      c.user.prenom?.toLowerCase().includes(searchLower) ||
      c.user.email?.toLowerCase().includes(searchLower)
    )
  })

  const getStatutBadge = (statut: string) => {
    const styles = {
      'validé': 'bg-green-100 text-green-700',
      'en attente': 'bg-yellow-100 text-yellow-700',
      'rejeté': 'bg-red-100 text-red-700'
    }
    return styles[statut as keyof typeof styles] || 'bg-gray-100 text-gray-700'
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Statistiques des Candidats</h1>
            <p className="text-gray-600 mt-1">Vue d'ensemble et exports</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={exportPdf}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <FileText className="h-5 w-5 mr-2" />
              Export PDF
            </button>
            <button
              onClick={exportExcel}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Export Excel
            </button>
          </div>
        </div>

        {/* Global Stats */}
        <div className="grid md:grid-cols-5 gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <Users className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{globalStats?.total_candidats || 0}</p>
            <p className="text-sm opacity-90">Total Candidats</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <TrendingUp className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{globalStats?.total_enrollements || 0}</p>
            <p className="text-sm opacity-90">Inscriptions</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <CheckCircle className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{globalStats?.valides || 0}</p>
            <p className="text-sm opacity-90">Validés</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg">
            <Clock className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{globalStats?.en_attente || 0}</p>
            <p className="text-sm opacity-90">En Attente</p>
          </div>
          
          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-6 text-white shadow-lg">
            <XCircle className="h-8 w-8 mb-3 opacity-80" />
            <p className="text-3xl font-bold">{globalStats?.rejetes || 0}</p>
            <p className="text-sm opacity-90">Rejetés</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Candidats par École */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <Building2 className="h-6 w-6 text-primary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Candidats par École</h2>
            </div>
            <div className="space-y-3">
              {ecoleStats.slice(0, 5).map((ecole, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{ecole.nom_ecole}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${(ecole.total / (globalStats?.total_enrollements || 1)) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-900 w-8 text-right">{ecole.total}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Filières */}
          <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-6 w-6 text-secondary-600 mr-2" />
              <h2 className="text-xl font-bold text-gray-900">Top Filières</h2>
            </div>
            <div className="space-y-3">
              {filiereStats.slice(0, 5).map((filiere, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{filiere.filiere}</p>
                    <p className="text-xs text-gray-600">{filiere.nom_ecole} - {filiere.niveau}</p>
                  </div>
                  <span className="px-3 py-1 bg-secondary-100 text-secondary-700 rounded-full text-sm font-bold">
                    {filiere.total}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Filter className="h-5 w-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-bold text-gray-900">Filtres</h3>
          </div>
          <div className="grid md:grid-cols-5 gap-4">
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
            
            <select
              value={selectedStatut}
              onChange={(e) => setSelectedStatut(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tous les statuts</option>
              <option value="validé">Validé</option>
              <option value="en attente">En attente</option>
              <option value="rejeté">Rejeté</option>
            </select>

            <select
              value={selectedNiveau}
              onChange={(e) => setSelectedNiveau(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Tous les niveaux</option>
              <option value="L1">L1</option>
              <option value="L2">L2</option>
              <option value="L3">L3</option>
              <option value="Master">Master</option>
            </select>

            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedEcole('')
                setSelectedFiliere('')
                setSelectedNiveau('')
                setSelectedStatut('')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Candidats Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-bold text-gray-900">
              Liste des Candidats ({filteredCandidats.length})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Candidat</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">École</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Filière</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Niveau</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Centre Dépôt</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCandidats.map((candidat) => (
                  <tr key={candidat.id_enrollement} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {candidat.user?.nom || 'N/A'} {candidat.user?.prenom || ''}
                        </p>
                        <p className="text-sm text-gray-600">{candidat.user?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {candidat.filiere?.departement?.ecole?.nom_ecole || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {candidat.filiere?.intitule || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                        {candidat.filiere?.niveau || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {candidat.centreDepot?.nom_centre || 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatutBadge(candidat.statut)}`}>
                        {candidat.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(candidat.created_at).toLocaleDateString('fr-FR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default CandidatStats
