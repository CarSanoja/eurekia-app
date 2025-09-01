import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 flex items-center justify-center">
        <div className="bg-white/95 rounded-3xl p-8 text-center shadow-2xl">
          <div className="text-6xl mb-4 animate-spin">⚡</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Loading your adventure...
          </h2>
          <p className="text-gray-600">
            Getting everything ready for you! 🚀
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}