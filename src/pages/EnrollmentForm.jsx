import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'
import { ecoleService } from '../services/ecoleService'
import { enrollmentService } from '../services/enrollmentService'
import Layout from '../components/Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { Upload, FileText } from 'lucide-react'

const EnrollmentForm = () => {
  const { ecoleId } = useParams()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors } } = useForm()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ecole, setEcole] = useState(null)
  const [paymentFile, setPaymentFile] = useState(null)

  useEffect(() => {
    loadEcole()
  }, [ecoleId])

  const loadEcole = async () => {
    try {
      const response = await ecoleService.getById(ecoleId)
      setEcole(response.data)
    } catch (error) {
      toast.error('Erreur lors du chargement de l\'école')
      navigate('/ecoles')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Le fichier ne doit pas dépasser 5 Mo')
        return
      }
      setPaymentFile(file)
    }
  }

  const onSubmit = async (data) => {
    if (!paymentFile) {
      toast.error('Veuillez télécharger votre justificatif de paiement')
      return
    }

    setSubmitting(true)
    try {
      const formData = new FormData()
      formData.append('id_ecole', ecoleId)
      formData.append('id_departement', data.id_departement)
      formData.append('id_filiere', data.id_filiere)
      formData.append('id_centre_depot', data.id_centre_depot)
      formData.append('id_centre_exam', data.id_centre_exam)
      formData.append('justificatif_paiement', paymentFile)
      formData.append('annee_academique', new Date().getFullYear())

      await enrollmentService.create(formData)
      toast.success('Inscription soumise avec succès !')
      navigate('/my-enrollments')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'inscription')
    } finally {
      setSubmitting(false)
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
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="card">
          <div className="flex items-center space-x-4 mb-6">
            {ecole.logo_path && (
              <img
                src={`http://localhost:8000/storage/${ecole.logo_path}`}
                alt={ecole.nom_ecole}
                className="h-16 w-16 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{ecole.nom_ecole}</h1>
              {ecole.sigle && <p className="text-primary-600">{ecole.sigle}</p>}
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Département *
              </label>
              <select
                {...register('id_departement', { required: 'Le département est requis' })}
                className="input-field"
              >
                <option value="">Sélectionner un département</option>
                {ecole.departements?.map((dept) => (
                  <option key={dept.id_departement} value={dept.id_departement}>
                    {dept.intitule}
                  </option>
                ))}
              </select>
              {errors.id_departement && (
                <p className="mt-1 text-sm text-red-600">{errors.id_departement.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filière *
              </label>
              <select
                {...register('id_filiere', { required: 'La filière est requise' })}
                className="input-field"
              >
                <option value="">Sélectionner une filière</option>
                {ecole.departements?.flatMap(dept => dept.filieres || []).map((filiere) => (
                  <option key={filiere.id_filiere} value={filiere.id_filiere}>
                    {filiere.intitule}
                  </option>
                ))}
              </select>
              {errors.id_filiere && (
                <p className="mt-1 text-sm text-red-600">{errors.id_filiere.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centre de dépôt de dossier *
              </label>
              <select
                {...register('id_centre_depot', { required: 'Le centre de dépôt est requis' })}
                className="input-field"
              >
                <option value="">Sélectionner un centre</option>
                {/* Les centres seront chargés dynamiquement */}
              </select>
              {errors.id_centre_depot && (
                <p className="mt-1 text-sm text-red-600">{errors.id_centre_depot.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Centre d'examen *
              </label>
              <select
                {...register('id_centre_exam', { required: 'Le centre d\'examen est requis' })}
                className="input-field"
              >
                <option value="">Sélectionner un centre</option>
                {/* Les centres seront chargés dynamiquement */}
              </select>
              {errors.id_centre_exam && (
                <p className="mt-1 text-sm text-red-600">{errors.id_centre_exam.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Justificatif de paiement *
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-400 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500">
                      <span>Télécharger un fichier</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 5 Mo</p>
                  {paymentFile && (
                    <p className="text-sm text-green-600 font-medium">
                      ✓ {paymentFile.name}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <FileText className="inline h-4 w-4 mr-1" />
                Assurez-vous que votre justificatif de paiement est clair et lisible. 
                Il sera vérifié par l'administration avant validation de votre inscription.
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Soumission en cours...' : 'Soumettre l\'inscription'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  )
}

export default EnrollmentForm
