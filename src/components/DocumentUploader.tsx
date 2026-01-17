import { useState } from 'react'
import { Upload, X, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface DocumentUploaderProps {
  requiredDocuments: { [key: string]: string }
  onDocumentsChange: (documents: { type: string; file: File }[]) => void
  errors?: { [key: string]: string }
}

const DocumentUploader = ({ requiredDocuments, onDocumentsChange, errors = {} }: DocumentUploaderProps) => {
  const [uploadedDocs, setUploadedDocs] = useState<{ [key: string]: File }>({})

  const handleFileChange = (type: string, file: File | null) => {
    const newDocs = { ...uploadedDocs }
    
    if (file) {
      newDocs[type] = file
    } else {
      delete newDocs[type]
    }
    
    setUploadedDocs(newDocs)
    
    // Convertir en tableau pour le parent
    const docsArray = Object.entries(newDocs).map(([type, file]) => ({ type, file }))
    onDocumentsChange(docsArray)
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const isDocumentUploaded = (type: string): boolean => {
    return !!uploadedDocs[type]
  }

  const allDocumentsUploaded = (): boolean => {
    return Object.keys(requiredDocuments).every(type => isDocumentUploaded(type))
  }

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="bg-gray-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            Progression : {Object.keys(uploadedDocs).length} / {Object.keys(requiredDocuments).length}
          </span>
          <span className="text-sm font-semibold text-primary-600">
            {Math.round((Object.keys(uploadedDocs).length / Object.keys(requiredDocuments).length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-primary-600 to-secondary-600 h-3 rounded-full transition-all duration-300"
            style={{ width: `${(Object.keys(uploadedDocs).length / Object.keys(requiredDocuments).length) * 100}%` }}
          />
        </div>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {Object.entries(requiredDocuments).map(([type, label]) => (
          <div
            key={type}
            className={`border-2 rounded-xl p-4 transition-all ${
              isDocumentUploaded(type)
                ? 'border-green-300 bg-green-50'
                : errors[type]
                ? 'border-red-300 bg-red-50'
                : 'border-gray-200 bg-white hover:border-primary-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {isDocumentUploaded(type) ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <FileText className="h-5 w-5 text-gray-400" />
                  )}
                  <label className="font-semibold text-gray-900">
                    {label}
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                </div>

                {uploadedDocs[type] ? (
                  <div className="flex items-center space-x-3 ml-7">
                    <div className="flex-1 bg-white border border-green-200 rounded-lg p-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadedDocs[type].name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {formatFileSize(uploadedDocs[type].size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleFileChange(type, null)}
                      className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <div className="ml-7">
                    <label className="cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            // Vérifier la taille (5MB max)
                            if (file.size > 5 * 1024 * 1024) {
                              alert('Le fichier est trop volumineux. Taille maximale : 5 MB')
                              return
                            }
                            handleFileChange(type, file)
                          }
                        }}
                        className="hidden"
                      />
                      <div className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
                        <Upload className="h-4 w-4 mr-2" />
                        Choisir un fichier
                      </div>
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      PDF, JPG, PNG (Max 5 MB)
                    </p>
                  </div>
                )}

                {errors[type] && (
                  <div className="flex items-center space-x-2 mt-2 ml-7">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-600">{errors[type]}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      {allDocumentsUploaded() && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <p className="font-semibold text-green-900">Tous les documents sont prêts !</p>
              <p className="text-sm text-green-700">
                Vous pouvez maintenant passer à l'étape suivante.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DocumentUploader
