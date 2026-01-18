import { useState, useRef } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader, FileText, X } from 'lucide-react'
import { createWorker } from 'tesseract.js'
import type { ExtractedPaymentData } from '../types/payment'

interface PaymentReceiptUploadProps {
  onFileSelect: (file: File, extractedData: ExtractedPaymentData | null) => void
  required?: boolean
}

const PaymentReceiptUpload = ({ onFileSelect, required = false }: PaymentReceiptUploadProps) => {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [extractedData, setExtractedData] = useState<ExtractedPaymentData | null>(null)
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const extractPaymentInfo = (text: string): ExtractedPaymentData => {
    const data: ExtractedPaymentData = {}

    // Extraire le montant (cherche des patterns comme: 50000, 50 000, 50.000, etc.)
    const montantPatterns = [
      /montant[:\s]+([0-9\s.,]+)\s*(FCFA|XAF|F\s*CFA)?/i,
      /total[:\s]+([0-9\s.,]+)\s*(FCFA|XAF|F\s*CFA)?/i,
      /somme[:\s]+([0-9\s.,]+)\s*(FCFA|XAF|F\s*CFA)?/i,
      /([0-9\s.,]+)\s*(FCFA|XAF|F\s*CFA)/i,
    ]

    for (const pattern of montantPatterns) {
      const match = text.match(pattern)
      if (match) {
        data.montant = match[1].replace(/\s/g, '').replace(/,/g, '')
        break
      }
    }

    // Extraire la référence (cherche des patterns comme: REF, N°, Reference, etc.)
    const refPatterns = [
      /r[eé]f[eé]rence[:\s]+([A-Z0-9-]+)/i,
      /r[eé]f[:\s]+([A-Z0-9-]+)/i,
      /n[°o][:\s]+([A-Z0-9-]+)/i,
      /transaction[:\s]+([A-Z0-9-]+)/i,
      /code[:\s]+([A-Z0-9-]+)/i,
    ]

    for (const pattern of refPatterns) {
      const match = text.match(pattern)
      if (match) {
        data.reference = match[1]
        break
      }
    }

    // Extraire la date (formats: DD/MM/YYYY, DD-MM-YYYY, etc.)
    const datePatterns = [
      /date[:\s]+(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
      /(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/,
    ]

    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        data.date = match[1]
        break
      }
    }

    // Extraire le nom de la banque
    const banques = [
      'BICEC', 'SGBC', 'UBA', 'ECOBANK', 'AFRILAND', 'SCB', 
      'CITIBANK', 'STANDARD CHARTERED', 'CBC', 'CCA', 'ADVANS'
    ]

    for (const banque of banques) {
      if (text.toUpperCase().includes(banque)) {
        data.banque = banque
        break
      }
    }

    return data
  }

  const processImage = async (imageFile: File) => {
    setProcessing(true)
    setError('')
    setExtractedData(null)

    try {
      // Créer un worker Tesseract
      const worker = await createWorker('fra')

      // Reconnaître le texte dans l'image
      const { data: { text } } = await worker.recognize(imageFile)
      
      // Extraire les informations de paiement
      const extracted = extractPaymentInfo(text)
      
      // Vérifier si au moins une information a été extraite
      if (!extracted.montant && !extracted.reference) {
        setError('Impossible d\'extraire les informations du reçu. Assurez-vous que l\'image est claire et lisible.')
      } else {
        setExtractedData(extracted)
      }

      await worker.terminate()
    } catch (err) {
      console.error('Erreur OCR:', err)
      setError('Erreur lors de la lecture du reçu. Veuillez réessayer.')
    } finally {
      setProcessing(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Vérifier le type de fichier
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!validTypes.includes(selectedFile.type)) {
      setError('Format non supporté. Utilisez JPG, PNG ou PDF.')
      return
    }

    // Vérifier la taille (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('Le fichier est trop volumineux (max 5MB).')
      return
    }

    setFile(selectedFile)
    setError('')

    // Créer un aperçu pour les images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(selectedFile)

      // Lancer l'OCR automatiquement
      await processImage(selectedFile)
    } else {
      setPreview('')
      // Pour les PDF, on ne fait pas d'OCR automatique
      setExtractedData(null)
    }

    // Notifier le parent
    onFileSelect(selectedFile, extractedData)
  }

  const handleRemove = () => {
    setFile(null)
    setPreview('')
    setExtractedData(null)
    setError('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onFileSelect(null as any, null)
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Reçu de paiement {required && <span className="text-red-500">*</span>}
        </label>
        
        {!file ? (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf"
              onChange={handleFileChange}
              className="hidden"
              id="payment-receipt"
            />
            <label htmlFor="payment-receipt" className="cursor-pointer">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-1">
                Cliquez pour télécharger le reçu
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG ou PDF (max 5MB)
              </p>
            </label>
          </div>
        ) : (
          <div className="border-2 border-gray-200 rounded-xl p-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-primary-600" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemove}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {preview && (
              <div className="mb-4">
                <img 
                  src={preview} 
                  alt="Aperçu du reçu" 
                  className="w-full h-48 object-contain bg-gray-50 rounded-lg"
                />
              </div>
            )}

            {processing && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center space-x-3">
                <Loader className="h-5 w-5 text-blue-600 animate-spin" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold">Analyse du reçu en cours...</p>
                  <p>Extraction des informations de paiement</p>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-semibold">Erreur</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {extractedData && !processing && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start space-x-3 mb-3">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-2">Informations extraites</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  {extractedData.montant && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Montant:</span>
                      <span className="font-semibold text-gray-900">
                        {extractedData.montant} FCFA
                      </span>
                    </div>
                  )}
                  {extractedData.reference && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Référence:</span>
                      <span className="font-semibold text-gray-900">
                        {extractedData.reference}
                      </span>
                    </div>
                  )}
                  {extractedData.date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-semibold text-gray-900">
                        {extractedData.date}
                      </span>
                    </div>
                  )}
                  {extractedData.banque && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Banque:</span>
                      <span className="font-semibold text-gray-900">
                        {extractedData.banque}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-1">Conseils pour un meilleur résultat</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Assurez-vous que le reçu est bien éclairé et lisible</li>
              <li>Évitez les photos floues ou de mauvaise qualité</li>
              <li>Le montant et la référence doivent être clairement visibles</li>
              <li>Utilisez de préférence un scan plutôt qu'une photo</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PaymentReceiptUpload
