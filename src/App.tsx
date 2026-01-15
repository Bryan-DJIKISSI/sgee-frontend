import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import VerifyEmail from './pages/auth/VerifyEmail'
import Dashboard from './pages/Dashboard'
import EcolesList from './pages/EcolesList'
import EnrollmentForm from './pages/EnrollmentForm'
import MyEnrollments from './pages/MyEnrollments'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminEcoles from './pages/admin/AdminEcoles'
import AdminConcours from './pages/admin/AdminConcours'
import AdminEnrollments from './pages/admin/AdminEnrollments'

// Components
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/ecoles" element={
              <ProtectedRoute>
                <EcolesList />
              </ProtectedRoute>
            } />
            <Route path="/enrollment/:ecoleId" element={
              <ProtectedRoute>
                <EnrollmentForm />
              </ProtectedRoute>
            } />
            <Route path="/my-enrollments" element={
              <ProtectedRoute>
                <MyEnrollments />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } />
            <Route path="/admin/ecoles" element={
              <AdminRoute>
                <AdminEcoles />
              </AdminRoute>
            } />
            <Route path="/admin/concours" element={
              <AdminRoute>
                <AdminConcours />
              </AdminRoute>
            } />
            <Route path="/admin/enrollments" element={
              <AdminRoute>
                <AdminEnrollments />
              </AdminRoute>
            } />
          </Routes>
          
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App
