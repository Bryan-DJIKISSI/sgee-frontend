import { CheckCircle } from 'lucide-react'

const VerifyEmail = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Vérification Email</h2>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-center text-gray-600">Page de vérification - À compléter</p>
        </div>
      </div>
    </div>
  )
}

export default VerifyEmail
