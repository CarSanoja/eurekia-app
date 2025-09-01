import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function AdminDashboard() {
  const { token } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    aiUsageToday: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/admin/stats/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats({
          totalUsers: data.total_users,
          totalCourses: data.total_courses,
          totalEnrollments: data.total_enrollments,
          aiUsageToday: data.ai_usage_today
        })
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: '👥',
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Active Courses',
      value: stats.totalCourses,
      icon: '📚',
      color: 'bg-green-500',
      change: '+3%',
      changeType: 'increase'
    },
    {
      title: 'Total Enrollments',
      value: stats.totalEnrollments,
      icon: '🎓',
      color: 'bg-purple-500',
      change: '+18%',
      changeType: 'increase'
    },
    {
      title: 'AI Usage Today',
      value: stats.aiUsageToday,
      icon: '🤖',
      color: 'bg-orange-500',
      change: '+5%',
      changeType: 'increase'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-1">Welcome to the Quanta Admin Studio</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {stat.value.toLocaleString()}
                </p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                  <span className="text-gray-500 text-sm ml-2">vs last month</span>
                </div>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Recent User Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { user: 'Alice Johnson', action: 'Completed "Morning Routine"', time: '2 minutes ago' },
                { user: 'Bob Smith', action: 'Joined new course', time: '15 minutes ago' },
                { user: 'Carol Davis', action: 'Generated progress report', time: '1 hour ago' },
                { user: 'Dave Wilson', action: 'Set new mission', time: '2 hours ago' }
              ].map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-sm">👤</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {activity.user}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {activity.action}
                    </p>
                  </div>
                  <div className="text-sm text-gray-400">
                    {activity.time}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { service: 'Backend API', status: 'healthy', uptime: '99.9%' },
                { service: 'Database', status: 'healthy', uptime: '99.8%' },
                { service: 'Redis Cache', status: 'healthy', uptime: '99.9%' },
                { service: 'Email Service', status: 'healthy', uptime: '98.5%' }
              ].map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-900">
                      {service.service}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {service.uptime} uptime
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}