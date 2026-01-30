import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import AdminLayout from '../../components/AdminLayout'
import { 
  Users, TrendingUp, CheckCircle, Clock, XCircle, 
  Download, FileText, FileSpreadsheet, Filter, Search,
  Building2, GraduationCap, ChevronDown, ChevronUp,
  School, BookOpen, Layers, Eye
} from 'lucide-react'
import { enrollmentService } from '../../services/enrollmentService'
import { ecoleService } from '../../services/ecoleService'

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

interface Enrollment {
  id_enrollement: number
  statut: string
  date_inscription: string
  candidat?: {
    matricule: string
    nom_pere: string
    prenom_pere?: string
    telephone?: string
  }
  user?: {
    name: string
    surname?: string
    email: string
  }
  ecole?: {
    id_ecole: number
    nom_ecole: string
    sigle?: string
  }
  filiere?: {
    id_filiere: number
    intitule: string
    code_filiere: string
    departement?: {
      id_departement: number
      intitule: string
      code_depart: string
    }
  }
  created_at: string
}

interface Ecole {
  id_ecole: number
  nom_ecole: string
  sigle: string
}

interface GroupedData {
  ecole: Ecole
  departements: {
    [key: string]: {
      id_departement: number
      intitule: string
      code_depart: string
      filieres: {
        [key: string]: {
          id_filiere: number
          intitule: string
          code_filiere: string
          enrollments: Enrollment[]
          stats: {
            total: number
            valide: number
            en_attente: number
            rejete: number
          }
        }
      }
    }
  }
  stats: {
    total: number
    valide: number
    en_attente: number
    rejete: number
  }
}

const CandidatStats = () => {
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [ecoleStats, setEcoleStats] = useState<EcoleStats[]>([])
  const [filiereStats, setFiliereStats] = useState<FiliereStats[]>([])
  const [groupedData, setGroupedData] = useState<GroupedData[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  
  // États pour les accordéons
  const [expandedEcoles, setExpandedEcoles] = useState<Set<number>>(new Set())
  const [expandedDepartements, setExpandedDepartements] = useState<Set<string>>(new Set())
  const [expandedFilieres, setExpandedFilieres] = useState<Set<string>>(new Set())
  
  // Pagination
  const [currentPage, setCurrentPage] = useState<{[key: string]: number}>({})
  const [perPage] = useState(10)
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatut, setSelectedStatut] = useState('')

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      await Promise.all([
        loadStats(),
        loadEnrollments()
      ])
    } catch (error) {
      console.error('Erreur chargement données:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/candidats/stats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      
      const data = await response.json()
      
      if (data.success) {
        setGlobalStats(data.data.global)
        setEcoleStats(data.data.par_ecole || [])
        setFiliereStats(data.data.par_filiere || [])
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error)
      setGlobalStats({
        total_candidats: 0,
        total_enrollements: 0,
        valides: 0,
        en_attente: 0,
        rejetes: 0
      })
      setEcoleStats([])
      setFiliereStats([])
    }
  }

  const loadEnrollments = async () => {
    try {
      const response = await enrollmentService.getAll()
      console.log('📊 Enrollments reçus:', response.data?.length || 0)
      console.log('📊 Premier enrollment:', response.data?.[0])
      groupEnrollmentsByStructure(response.data || [])
    } catch (error) {
      console.error('Erreur chargement enrollments:', error)
      setGroupedData([])
    }
  }

  const groupEnrollmentsByStructure = (enrollments: Enrollment[]) => {
    const grouped: {[key: number]: GroupedData} = {}

    console.log('🔄 Groupement de', enrollments.length, 'enrollments')
    
    enrollments.forEach(enrollment => {
      if (!enrollment.ecole) {
        console.warn('⚠️ Enrollment sans école:', enrollment.id_enrollement)
        return
      }

      const ecoleId = enrollment.ecole.id_ecole
      
      if (!grouped[ecoleId]) {
        grouped[ecoleId] = {
          ecole: enrollment.ecole as Ecole,
          departements: {},
          stats: { total: 0, valide: 0, en_attente: 0, rejete: 0 }
        }
      }

      // Stats école
      grouped[ecoleId].stats.total++
      if (enrollment.statut === 'validé') grouped[ecoleId].stats.valide++
      if (enrollment.statut === 'en attente') grouped[ecoleId].stats.en_attente++
      if (enrollment.statut === 'rejeté') grouped[ecoleId].stats.rejete++

      if (enrollment.filiere && enrollment.filiere.departement) {
        const deptKey = `${ecoleId}-${enrollment.filiere.departement.id_departement}`
        
        if (!grouped[ecoleId].departements[deptKey]) {
          grouped[ecoleId].departements[deptKey] = {
            ...enrollment.filiere.departement,
            filieres: {}
          }
        }

        const filiereKey = `${deptKey}-${enrollment.filiere.id_filiere}`
        
        if (!grouped[ecoleId].departements[deptKey].filieres[filiereKey]) {
          grouped[ecoleId].departements[deptKey].filieres[filiereKey] = {
            ...enrollment.filiere,
            enrollments: [],
            stats: { total: 0, valide: 0, en_attente: 0, rejete: 0 }
          }
        }

        grouped[ecoleId].departements[deptKey].filieres[filiereKey].enrollments.push(enrollment)
        
        // Stats filière
        const filiereStats = grouped[ecoleId].departements[deptKey].filieres[filiereKey].stats
        filiereStats.total++
        if (enrollment.statut === 'validé') filiereStats.valide++
        if (enrollment.statut === 'en attente') filiereStats.en_attente++
        if (enrollment.statut === 'rejeté') filiereStats.rejete++
      } else {
        console.warn('⚠️ Enrollment sans filière ou département:', enrollment.id_enrollement, {
          hasFiliere: !!enrollment.filiere,
          hasDepartement: !!enrollment.filiere?.departement
        })
      }
    })

    const groupedArray = Object.values(grouped)
    console.log('✅ Groupement terminé:', groupedArray.length, 'écoles')
    groupedArray.forEach(ecole => {
      const deptCount = Object.keys(ecole.departements).length
      let filiereCount = 0
      Object.values(ecole.departements).forEach(dept => {
        filiereCount += Object.keys(dept.filieres).length
      })
      console.log(`  📚 ${ecole.ecole.nom_ecole}: ${deptCount} départements, ${filiereCount} filières, ${ecole.stats.total} candidats`)
    })
    
    setGroupedData(groupedArray)
  }

  const toggleEcole = (ecoleId: number) => {
    const newExpanded = new Set(expandedEcoles)
    if (newExpanded.has(ecoleId)) {
      newExpanded.delete(ecoleId)
    } else {
      newExpanded.add(ecoleId)
    }
    setExpandedEcoles(newExpanded)
  }

  const toggleDepartement = (deptKey: string) => {
    const newExpanded = new Set(expandedDepartements)
    if (newExpanded.has(deptKey)) {
      newExpanded.delete(deptKey)
    } else {
      newExpanded.add(deptKey)
    }
    setExpandedDepartements(newExpanded)
  }

  const toggleFiliere = (filiereKey: string) => {
    const newExpanded = new Set(expandedFilieres)
    if (newExpanded.has(filiereKey)) {
      newExpanded.delete(filiereKey)
    } else {
      newExpanded.add(filiereKey)
    }
    setExpandedFilieres(newExpanded)
  }

  const getPaginatedEnrollments = (enrollments: Enrollment[], key: string) => {
    const page = currentPage[key] || 1
    const start = (page - 1) * perPage
    const end = start + perPage
    
    // Filtrer par recherche et statut
    let filtered = enrollments
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(e => 
        e.user?.name?.toLowerCase().includes(search) ||
        e.user?.surname?.toLowerCase().includes(search) ||
        e.user?.email?.toLowerCase().includes(search) ||
        e.candidat?.matricule?.toLowerCase().includes(search)
      )
    }
    if (selectedStatut) {
      filtered = filtered.filter(e => e.statut === selectedStatut)
    }
    
    return filtered.slice(start, end)
  }

  const getTotalPages = (enrollments: Enrollment[], key: string) => {
    let filtered = enrollments
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      filtered = filtered.filter(e => 
        e.user?.name?.toLowerCase().includes(search) ||
        e.user?.surname?.toLowerCase().includes(search) ||
        e.user?.email?.toLowerCase().includes(search) ||
        e.candidat?.matricule?.toLowerCase().includes(search)
      )
    }
    if (selectedStatut) {
      filtered = filtered.filter(e => e.statut === selectedStatut)
    }
    return Math.ceil(filtered.length / perPage)
  }

  const changePage = (key: string, page: number) => {
    setCurrentPage(prev => ({ ...prev, [key]: page }))
  }

  const exportPdf = async (ecoleId?: number, filiereId?: number) => {
    setExporting(true)
    try {
      let url = `${import.meta.env.VITE_API_URL}/candidats/export/pdf?`
      if (ecoleId) url += `ecole_id=${ecoleId}&`
      if (filiereId) url += `filiere_id=${filiereId}&`
      if (selectedStatut) url += `statut=${selectedStatut}`

      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `candidats_${ecoleId || 'tous'}_${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      toast.success('Export PDF réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export PDF')
    } finally {
      setExporting(false)
    }
  }

  const exportExcel = async (ecoleId?: number, filiereId?: number) => {
    setExporting(true)
    try {
      let url = `${import.meta.env.VITE_API_URL}/candidats/export/excel?`
      if (ecoleId) url += `ecole_id=${ecoleId}&`
      if (filiereId) url += `filiere_id=${filiereId}&`
      if (selectedStatut) url += `statut=${selectedStatut}`

      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = `candidats_${ecoleId || 'tous'}_${Date.now()}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
      toast.success('Export Excel réussi')
    } catch (error) {
      toast.error('Erreur lors de l\'export Excel')
    } finally {
      setExporting(false)
    }
  }

  const getStatusBadge = (statut: string) => {
    const styles = {
      'en attente': 'bg-yellow-100 text-yellow-700',
      'validé': 'bg-green-100 text-green-700',
      'rejeté': 'bg-red-100 text-red-700',
    }
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${styles[statut as keyof typeof styles] || 'bg-gray-100 text-gray-700'}`}>
        {statut}
      </span>
    )
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
            <p className="text-gray-600 mt-1">Organisation par École → Département → Filière</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => exportPdf()}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              <FileText className="h-5 w-5 mr-2" />
              Export PDF Global
            </button>
            <button
              onClick={() => exportExcel()}
              disabled={exporting}
              className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FileSpreadsheet className="h-5 w-5 mr-2" />
              Export Excel Global
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
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un candidat..."
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

            <button
              onClick={() => {
                setSearchTerm('')
                setSelectedStatut('')
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Réinitialiser
            </button>
          </div>
        </div>

        {/* Liste hiérarchique des candidats par École/Département/Filière */}
        <div className="space-y-4">
          {groupedData.map((ecoleData) => (
            <div key={ecoleData.ecole.id_ecole} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              {/* En-tête École */}
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => toggleEcole(ecoleData.ecole.id_ecole)}
                      className="p-2 hover:bg-blue-200 rounded-lg transition-colors"
                    >
                      {expandedEcoles.has(ecoleData.ecole.id_ecole) ? (
                        <ChevronUp className="h-6 w-6 text-blue-600" />
                      ) : (
                        <ChevronDown className="h-6 w-6 text-blue-600" />
                      )}
                    </button>
                    <School className="h-8 w-8 text-blue-600" />
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{ecoleData.ecole.nom_ecole}</h2>
                      <p className="text-sm text-gray-600">{ecoleData.ecole.sigle}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-3xl font-bold text-blue-600">{ecoleData.stats.total}</p>
                      <p className="text-sm text-gray-600">candidats</p>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportPdf(ecoleData.ecole.id_ecole)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                        title="Export PDF de cette école"
                      >
                        <FileText className="h-4 w-4" />
                        <span>PDF</span>
                      </button>
                      <button
                        onClick={() => exportExcel(ecoleData.ecole.id_ecole)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                        title="Export Excel de cette école"
                      >
                        <Download className="h-4 w-4" />
                        <span>Excel</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Stats École */}
                <div className="mt-4 grid grid-cols-3 gap-4">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Validés</p>
                    <p className="text-2xl font-bold text-green-600">{ecoleData.stats.valide}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">En attente</p>
                    <p className="text-2xl font-bold text-yellow-600">{ecoleData.stats.en_attente}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-sm text-gray-600">Rejetés</p>
                    <p className="text-2xl font-bold text-red-600">{ecoleData.stats.rejete}</p>
                  </div>
                </div>
              </div>

              {/* Départements */}
              {expandedEcoles.has(ecoleData.ecole.id_ecole) && (
                <div className="p-4 space-y-4">
                  {Object.entries(ecoleData.departements).map(([deptKey, dept]) => (
                    <div key={deptKey} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* En-tête Département */}
                      <div className="bg-gray-50 p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => toggleDepartement(deptKey)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              {expandedDepartements.has(deptKey) ? (
                                <ChevronUp className="h-5 w-5 text-gray-600" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-600" />
                              )}
                            </button>
                            <Layers className="h-6 w-6 text-gray-600" />
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">{dept.intitule}</h3>
                              <p className="text-sm text-gray-600">{dept.code_depart}</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Filières */}
                      {expandedDepartements.has(deptKey) && (
                        <div className="p-4 space-y-3">
                          {Object.entries(dept.filieres).map(([filiereKey, filiere]) => {
                            const paginatedEnrollments = getPaginatedEnrollments(filiere.enrollments, filiereKey)
                            const totalPages = getTotalPages(filiere.enrollments, filiereKey)
                            const currentPageNum = currentPage[filiereKey] || 1
                            
                            return (
                              <div key={filiereKey} className="border border-gray-200 rounded-lg overflow-hidden">
                                {/* En-tête Filière */}
                                <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <button
                                        onClick={() => toggleFiliere(filiereKey)}
                                        className="p-1 hover:bg-purple-200 rounded transition-colors"
                                      >
                                        {expandedFilieres.has(filiereKey) ? (
                                          <ChevronUp className="h-5 w-5 text-purple-600" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5 text-purple-600" />
                                        )}
                                      </button>
                                      <BookOpen className="h-5 w-5 text-purple-600" />
                                      <div>
                                        <h4 className="font-bold text-gray-900">{filiere.intitule}</h4>
                                        <p className="text-sm text-gray-600">{filiere.code_filiere}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <div className="text-right">
                                        <p className="text-xl font-bold text-purple-600">{filiere.stats.total}</p>
                                        <p className="text-xs text-gray-600">candidats</p>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => exportPdf(ecoleData.ecole.id_ecole, filiere.id_filiere)}
                                          className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                                          title="Export PDF de cette filière"
                                        >
                                          <FileText className="h-4 w-4" />
                                        </button>
                                        <button
                                          onClick={() => exportExcel(ecoleData.ecole.id_ecole, filiere.id_filiere)}
                                          className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                                          title="Export Excel de cette filière"
                                        >
                                          <Download className="h-4 w-4" />
                                        </button>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Liste des candidats */}
                                {expandedFilieres.has(filiereKey) && paginatedEnrollments.length > 0 && (
                                  <div className="p-4">
                                    <div className="overflow-x-auto">
                                      <table className="w-full">
                                        <thead className="bg-gray-50">
                                          <tr>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Matricule</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Nom & Prénom</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Email</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Téléphone</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Statut</th>
                                            <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600">Date</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                          {paginatedEnrollments.map((enrollment) => (
                                            <tr key={enrollment.id_enrollement} className="hover:bg-gray-50">
                                              <td className="px-4 py-3 text-sm">{enrollment.candidat?.matricule}</td>
                                              <td className="px-4 py-3 text-sm font-medium">
                                                {enrollment.user?.name} {enrollment.user?.surname}
                                              </td>
                                              <td className="px-4 py-3 text-sm text-gray-600">{enrollment.user?.email}</td>
                                              <td className="px-4 py-3 text-sm text-gray-600">{enrollment.candidat?.telephone || 'N/A'}</td>
                                              <td className="px-4 py-3">{getStatusBadge(enrollment.statut)}</td>
                                              <td className="px-4 py-3 text-sm text-gray-600">
                                                {new Date(enrollment.created_at).toLocaleDateString('fr-FR')}
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>

                                    {/* Pagination */}
                                    {totalPages > 1 && (
                                      <div className="mt-4 flex items-center justify-between">
                                        <p className="text-sm text-gray-600">
                                          Page {currentPageNum} sur {totalPages}
                                        </p>
                                        <div className="flex space-x-2">
                                          <button
                                            onClick={() => changePage(filiereKey, currentPageNum - 1)}
                                            disabled={currentPageNum === 1}
                                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            Précédent
                                          </button>
                                          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                            let page
                                            if (totalPages <= 5) {
                                              page = i + 1
                                            } else if (currentPageNum <= 3) {
                                              page = i + 1
                                            } else if (currentPageNum >= totalPages - 2) {
                                              page = totalPages - 4 + i
                                            } else {
                                              page = currentPageNum - 2 + i
                                            }
                                            return (
                                              <button
                                                key={page}
                                                onClick={() => changePage(filiereKey, page)}
                                                className={`px-3 py-1 border rounded ${
                                                  currentPageNum === page
                                                    ? 'bg-primary-600 text-white border-primary-600'
                                                    : 'border-gray-300 hover:bg-gray-50'
                                                }`}
                                              >
                                                {page}
                                              </button>
                                            )
                                          })}
                                          <button
                                            onClick={() => changePage(filiereKey, currentPageNum + 1)}
                                            disabled={currentPageNum === totalPages}
                                            className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                            Suivant
                                          </button>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {groupedData.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl shadow-md">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun candidat</h3>
            <p className="text-gray-600">Les candidats inscrits apparaîtront ici</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default CandidatStats
