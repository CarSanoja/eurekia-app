import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'

export default function AIUsagePage() {
  const { token } = useAuth()
  const [usageData, setUsageData] = useState({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
    requestsToday: 0,
    averageResponseTime: 0
  })
  const [recentUsage, setRecentUsage] = useState([])
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState('7d')

  useEffect(() => {
    fetchAIUsage()
  }, [timeframe])

  const fetchAIUsage = async () => {
    try {
      setLoading(true)
      // Simulate API call - in real implementation, this would be an admin endpoint
      setTimeout(() => {
        setUsageData({
          totalRequests: 1247,
          totalTokens: 125000,
          totalCost: 18.75,
          requestsToday: 156,
          averageResponseTime: 1.2
        })
        
        setRecentUsage([
          {
            id: '1',
            user: 'Alice Johnson',
            feature: 'Progress Report',
            tokens: 1250,
            cost: 0.025,
            timestamp: '2025-09-01T03:15:30.000Z',
            responseTime: 1.1
          },
          {
            id: '2',
            user: 'Bob Smith',
            feature: 'Hero Infographic',
            tokens: 2100,
            cost: 0.042,
            timestamp: '2025-09-01T03:12:15.000Z',
            responseTime: 1.8
          },
          {
            id: '3',
            user: 'Carol Davis',
            feature: 'Habit Insights',
            tokens: 850,
            cost: 0.017,
            timestamp: '2025-09-01T03:08:45.000Z',
            responseTime: 0.9
          },
          {
            id: '4',
            user: 'Dave Wilson',
            feature: 'Progress Report',
            tokens: 1100,
            cost: 0.022,
            timestamp: '2025-09-01T02:55:20.000Z',
            responseTime: 1.3
          },
          {
            id: '5',
            user: 'Emma Brown',
            feature: 'Mission Analysis',
            tokens: 1800,
            cost: 0.036,
            timestamp: '2025-09-01T02:42:10.000Z',
            responseTime: 1.5
          }
        ])
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error('Error fetching AI usage:', error)
      setLoading(false)
    }
  }

  const exportUsageData = () => {
    const csvContent = [
      ['User', 'Feature', 'Tokens', 'Cost (USD)', 'Response Time (s)', 'Timestamp'],
      ...recentUsage.map(usage => [
        usage.user,
        usage.feature,
        usage.tokens,
        usage.cost.toFixed(3),
        usage.responseTime,
        new Date(usage.timestamp).toISOString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-usage-${timeframe}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const statCards = [
    {
      title: 'Total Requests',
      value: usageData.totalRequests.toLocaleString(),
      icon: '🤖',
      color: 'bg-blue-500',
      subtitle: `${usageData.requestsToday} today`
    },
    {
      title: 'Total Tokens',
      value: usageData.totalTokens.toLocaleString(),
      icon: '🔢',
      color: 'bg-green-500',
      subtitle: 'Input + Output'
    },
    {
      title: 'Total Cost',
      value: `$${usageData.totalCost.toFixed(2)}`,
      icon: '💰',
      color: 'bg-purple-500',
      subtitle: 'This month'
    },
    {
      title: 'Avg Response Time',
      value: `${usageData.averageResponseTime}s`,
      icon: '⚡',
      color: 'bg-orange-500',
      subtitle: 'Last 24 hours'
    }
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Usage Analytics</h1>
          <p className="text-gray-600 mt-1">Monitor AI API usage and costs</p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button
            onClick={exportUsageData}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            📊 Export Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div key={stat.title} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-gray-500 mt-1">{stat.subtitle}</p>
              </div>
              <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
                <span className="text-white text-xl">{stat.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Usage by Feature */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Usage by Feature</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { feature: 'Progress Report', requests: 487, percentage: 39 },
                { feature: 'Hero Infographic', requests: 312, percentage: 25 },
                { feature: 'Habit Insights', requests: 248, percentage: 20 },
                { feature: 'Mission Analysis', requests: 124, percentage: 10 },
                { feature: 'Mood Analysis', requests: 76, percentage: 6 }
              ].map((item) => (
                <div key={item.feature} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{item.feature}</span>
                      <span className="text-gray-500">{item.requests} requests</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h3 className="text-lg font-medium text-gray-900">Cost Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { category: 'Text Generation', cost: 12.45, percentage: 66 },
                { category: 'Image Analysis', cost: 4.80, percentage: 26 },
                { category: 'Data Processing', cost: 1.50, percentage: 8 }
              ].map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-900">{item.category}</span>
                      <span className="text-gray-500">${item.cost.toFixed(2)}</span>
                    </div>
                    <div className="mt-1 w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Usage */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Recent AI Requests</h3>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Response Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentUsage.map((usage) => (
                  <tr key={usage.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {usage.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {usage.feature}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usage.tokens.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${usage.cost.toFixed(3)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {usage.responseTime}s
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(usage.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}