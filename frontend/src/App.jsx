import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import MainApp from './components/MainApp'

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
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <MainApp />
              </ProtectedRoute>
            } />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  )
}

export default App