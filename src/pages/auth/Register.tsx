import { Link } from 'react-router-dom'
import { UserPlus } from 'lucide-react'

const Register = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <UserPlus className="mx-auto h-12 w-12 text-primary-600" />
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Créer un compte</h2>
          <p className="mt-2 text-sm text-gray-600">
            Déjà inscrit ?{' '}
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Se connecter
            </Link>
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-8">
          <p className="text-center text-gray-600">Page d'inscription - À compléter</p>
        </div>
      </div>
    </div>
  )
}

export default Register
