import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

export default function HabitCalendar({ habitData = [], currentMonth = new Date() }) {
  const [selectedDate, setSelectedDate] = useState(null)

  const { calendar, stats } = useMemo(() => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of month and days in month
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    // Create calendar grid
    const calendar = []
    const today = new Date()
    
    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendar.push({ isEmpty: true, key: `empty-${i}` })
    }

    // Create data map for quick lookup
    const dataMap = new Map()
    habitData.forEach(entry => {
      const dateKey = entry.date // Assuming format YYYY-MM-DD
      if (!dataMap.has(dateKey)) {
        dataMap.set(dateKey, { completed: 0, total: 0, habits: [] })
      }
      const dayData = dataMap.get(dateKey)
      dayData.total++
      if (entry.completed) {
        dayData.completed++
      }
      dayData.habits.push(entry)
    })

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const dateKey = date.toISOString().split('T')[0]
      const dayData = dataMap.get(dateKey) || { completed: 0, total: 0, habits: [] }
      
      calendar.push({
        day,
        date,
        dateKey,
        isToday: date.toDateString() === today.toDateString(),
        isFuture: date > today,
        completed: dayData.completed,
        total: dayData.total,
        habits: dayData.habits,
        completionRate: dayData.total > 0 ? (dayData.completed / dayData.total) * 100 : 0,
        key: `day-${day}`
      })
    }

    // Calculate stats
    const completedDays = calendar.filter(day => !day.isEmpty && day.completionRate === 100).length
    const partialDays = calendar.filter(day => !day.isEmpty && day.completionRate > 0 && day.completionRate < 100).length
    const totalDays = calendar.filter(day => !day.isEmpty && !day.isFuture && day.total > 0).length

    const stats = {
      perfectDays: completedDays,
      partialDays: partialDays,
      totalActiveDays: totalDays,
      successRate: totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0
    }

    return { calendar, stats }
  }, [habitData, currentMonth])

  const getCellColor = (day) => {
    if (day.isEmpty || day.isFuture) return 'bg-gray-50'
    if (day.total === 0) return 'bg-gray-100'
    
    const rate = day.completionRate
    if (rate === 100) return 'bg-green-500'
    if (rate >= 75) return 'bg-green-400'
    if (rate >= 50) return 'bg-yellow-400'
    if (rate >= 25) return 'bg-orange-400'
    if (rate > 0) return 'bg-red-400'
    return 'bg-gray-200'
  }

  const getCellTextColor = (day) => {
    if (day.isEmpty || day.total === 0) return 'text-gray-400'
    return day.completionRate >= 50 ? 'text-white' : 'text-gray-700'
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">
          📅 {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <div className="text-sm text-gray-600">
          {stats.perfectDays} perfect days
        </div>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6">
        {calendar.map((day) => (
          <motion.div
            key={day.key}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: Math.random() * 0.1 }}
            className={`
              aspect-square rounded-lg flex items-center justify-center text-sm font-medium
              cursor-pointer transition-all duration-200 hover:scale-110
              ${getCellColor(day)} ${getCellTextColor(day)}
              ${day.isToday ? 'ring-2 ring-purple-500 ring-offset-2' : ''}
              ${selectedDate === day.dateKey ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
            onClick={() => !day.isEmpty && setSelectedDate(day.dateKey)}
            whileHover={{ scale: day.isEmpty ? 1 : 1.1 }}
            whileTap={{ scale: day.isEmpty ? 1 : 0.95 }}
          >
            {!day.isEmpty && (
              <div className="text-center">
                <div>{day.day}</div>
                {day.total > 0 && (
                  <div className="text-xs opacity-80">
                    {day.completed}/{day.total}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 text-xs text-gray-600 mb-4">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded"></div>
          <span>No data</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-400 rounded"></div>
          <span>Low</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-yellow-400 rounded"></div>
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Perfect</span>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
        <div className="text-center">
          <div className="text-lg font-bold text-green-600">{stats.perfectDays}</div>
          <div className="text-xs text-gray-500">Perfect</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-yellow-600">{stats.partialDays}</div>
          <div className="text-xs text-gray-500">Partial</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-blue-600">{stats.totalActiveDays}</div>
          <div className="text-xs text-gray-500">Active</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-600">{stats.successRate}%</div>
          <div className="text-xs text-gray-500">Success</div>
        </div>
      </div>

      {/* Selected Day Details */}
      {selectedDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 p-4 bg-blue-50 rounded-xl border-2 border-blue-100"
        >
          <h4 className="font-bold text-blue-800 mb-2">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h4>
          {calendar.find(day => day.dateKey === selectedDate)?.habits.length > 0 ? (
            <div className="space-y-2">
              {calendar.find(day => day.dateKey === selectedDate)?.habits.map((habit, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">{habit.name}</span>
                  <span className={`font-medium ${habit.completed ? 'text-green-600' : 'text-red-600'}`}>
                    {habit.completed ? '✅ Done' : '❌ Missed'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-blue-600 text-sm">No habits tracked on this day</p>
          )}
        </motion.div>
      )}
    </div>
  )
}