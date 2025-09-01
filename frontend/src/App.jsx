import { BrowserRouter as Router } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'react-hot-toast'

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
        <div className="min-h-screen bg-gray-50">
          <h1 className="text-3xl font-bold text-center py-8 text-primary-600">
            Quanta Habit Tracker
          </h1>
          <p className="text-center text-gray-600">MVP under construction</p>
        </div>
        <Toaster position="top-right" />
      </Router>
    </QueryClientProvider>
  )
}

export default App