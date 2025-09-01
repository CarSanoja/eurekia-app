import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function EnrollmentsPage() {
  const { token } = useAuth()
  const [enrollments, setEnrollments] = useState([])
  const [courses, setCourses] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCourse, setSelectedCourse] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newEnrollment, setNewEnrollment] = useState({
    user: '',
    course: '',
    role: 'student'
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [enrollmentsRes, coursesRes, usersRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/admin/enrollments/`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/admin/courses/`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        }),
        fetch(`${import.meta.env.VITE_API_URL}/admin/users/`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
        })
      ])
      
      if (enrollmentsRes.ok && coursesRes.ok && usersRes.ok) {
        const [enrollmentsData, coursesData, usersData] = await Promise.all([
          enrollmentsRes.json(),
          coursesRes.json(),
          usersRes.json()
        ])
        setEnrollments(enrollmentsData)
        setCourses(coursesData)
        setUsers(usersData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEnrollment = async (e) => {
    e.preventDefault()
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/enrollments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEnrollment)
      })
      
      if (response.ok) {
        const enrollment = await response.json()
        setEnrollments([enrollment, ...enrollments])
        setNewEnrollment({ user: '', course: '', role: 'student' })
        setShowCreateForm(false)
      }
    } catch (error) {
      console.error('Error creating enrollment:', error)
    }
  }

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (!confirm('Are you sure you want to remove this enrollment?')) return
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/enrollments/${enrollmentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        setEnrollments(enrollments.filter(e => e.id !== enrollmentId))
      }
    } catch (error) {
      console.error('Error deleting enrollment:', error)
    }
  }

  const handleUpdateRole = async (enrollmentId, newRole) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/enrollments/${enrollmentId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: newRole })
      })
      
      if (response.ok) {
        setEnrollments(enrollments.map(enrollment => 
          enrollment.id === enrollmentId 
            ? { ...enrollment, role: newRole }
            : enrollment
        ))
      }
    } catch (error) {
      console.error('Error updating enrollment:', error)
    }
  }

  const filteredEnrollments = enrollments.filter(enrollment => {
    const matchesSearch = enrollment.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         enrollment.course.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCourse = !selectedCourse || enrollment.course.id === selectedCourse
    return matchesSearch && matchesCourse
  })

  const getRoleBadge = (role) => {
    const styles = {
      student: 'bg-blue-100 text-blue-800',
      coach: 'bg-purple-100 text-purple-800'
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}>
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="bg-white rounded-lg shadow p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Enrollment Management</h1>
          <p className="text-gray-600 mt-1">Manage user enrollments in courses</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Add Enrollment
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by user name, email, or course..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="sm:w-64">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          {filteredEnrollments.length} of {enrollments.length} enrollments
        </div>
      </div>

      {showCreateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleCreateEnrollment} className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Enrollment</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  User
                </label>
                <select
                  value={newEnrollment.user}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, user: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course
                </label>
                <select
                  value={newEnrollment.course}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, course: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select Course</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.code})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={newEnrollment.role}
                  onChange={(e) => setNewEnrollment({ ...newEnrollment, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="student">Student</option>
                  <option value="coach">Coach</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                type="submit"
                className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                Add Enrollment
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {filteredEnrollments.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-lg font-medium mb-2">No enrollments found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrolled
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredEnrollments.map((enrollment) => (
                    <tr key={enrollment.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white mr-3"
                            style={{ backgroundColor: enrollment.user.avatar_color }}
                          >
                            {enrollment.user.avatar_icon}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {enrollment.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {enrollment.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {enrollment.course.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {enrollment.course.code}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(enrollment.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2 justify-end">
                          <select
                            value={enrollment.role}
                            onChange={(e) => handleUpdateRole(enrollment.id, e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="student">Student</option>
                            <option value="coach">Coach</option>
                          </select>
                          <button
                            onClick={() => handleDeleteEnrollment(enrollment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}