export default function TestApp() {
  return (
    <div className="min-h-screen bg-blue-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4">
          🚀 Quanta Frontend Test
        </h1>
        <p className="text-blue-700 text-lg">
          If you can see this, React is working! ✅
        </p>
        <div className="mt-8 p-4 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">
            Frontend is running on: <strong>http://localhost:5173</strong>
          </p>
          <p className="text-gray-600 mt-2">
            Backend is running on: <strong>http://localhost:8001</strong>
          </p>
        </div>
      </div>
    </div>
  )
}