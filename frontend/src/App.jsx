import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainApp from './components/MainApp'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import CoursesPage from './pages/admin/CoursesPage'
import UsersPage from './pages/admin/UsersPage'
import AIUsagePage from './pages/admin/AIUsagePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 2,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            <Route path="/" element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } />
            
            <Route path="/studio" element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<AdminDashboard />} />
              <Route path="courses" element={<CoursesPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="ai-usage" element={<AIUsagePage />} />
              <Route path="enrollments" element={<div className="p-6 text-center text-gray-500">Enrollments page coming soon...</div>} />
              <Route path="resources" element={<div className="p-6 text-center text-gray-500">Resources page coming soon...</div>} />
            </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App