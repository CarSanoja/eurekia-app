import { useMemo } from 'react'
import { motion } from 'framer-motion'

export default function ProgressChart({ data, type = 'line', title, height = 200 }) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // Normalize data for different chart types
    const max = Math.max(...data.map(d => d.value))
    const min = Math.min(...data.map(d => d.value))
    const range = max - min || 1

    return data.map((point, index) => ({
      ...point,
      normalizedValue: ((point.value - min) / range) * (height - 40) + 20,
      x: (index / (data.length - 1)) * 280 + 20,
      index
    }))
  }, [data, height])

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-md">
        <h3 className="text-lg font-bold text-gray-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-gray-400">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <p>No data to display yet</p>
            <p className="text-sm mt-1">Start tracking your habits to see progress!</p>
          </div>
        </div>
      </div>
    )
  }

  const renderLineChart = () => {
    const pathData = chartData.map((point, index) => 
      `${index === 0 ? 'M' : 'L'} ${point.x} ${height - point.normalizedValue}`
    ).join(' ')

    const areaData = `${pathData} L ${chartData[chartData.length - 1]?.x || 0} ${height - 20} L 20 ${height - 20} Z`

    return (
      <svg width="320" height={height} className="overflow-visible">
        {/* Grid lines */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgb(168, 85, 247)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="rgb(168, 85, 247)" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        {/* Grid */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="20"
            y1={20 + ratio * (height - 40)}
            x2="300"
            y2={20 + ratio * (height - 40)}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}

        {/* Area fill */}
        <motion.path
          d={areaData}
          fill="url(#areaGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        />

        {/* Line */}
        <motion.path
          d={pathData}
          stroke="rgb(168, 85, 247)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
        />

        {/* Data points */}
        {chartData.map((point, index) => (
          <motion.g key={index}>
            <motion.circle
              cx={point.x}
              cy={height - point.normalizedValue}
              r="5"
              fill="white"
              stroke="rgb(168, 85, 247)"
              strokeWidth="3"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + index * 0.1 }}
              className="cursor-pointer hover:r-6 transition-all"
            />
            
            {/* Tooltip on hover */}
            <motion.g
              initial={{ opacity: 0, scale: 0.8 }}
              whileHover={{ opacity: 1, scale: 1 }}
              className="pointer-events-none"
            >
              <rect
                x={point.x - 25}
                y={height - point.normalizedValue - 35}
                width="50"
                height="25"
                rx="6"
                fill="rgb(75, 85, 99)"
                fillOpacity="0.9"
              />
              <text
                x={point.x}
                y={height - point.normalizedValue - 18}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {point.value}
              </text>
            </motion.g>
          </motion.g>
        ))}
      </svg>
    )
  }

  const renderBarChart = () => {
    const barWidth = 280 / chartData.length * 0.6
    const barSpacing = 280 / chartData.length

    return (
      <svg width="320" height={height}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
          <line
            key={ratio}
            x1="20"
            y1={20 + ratio * (height - 40)}
            x2="300"
            y2={20 + ratio * (height - 40)}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="2,2"
          />
        ))}

        {/* Bars */}
        {chartData.map((point, index) => (
          <motion.rect
            key={index}
            x={20 + index * barSpacing + (barSpacing - barWidth) / 2}
            y={height - point.normalizedValue}
            width={barWidth}
            height={point.normalizedValue - 20}
            fill="rgb(168, 85, 247)"
            rx="4"
            initial={{ height: 0, y: height - 20 }}
            animate={{ 
              height: point.normalizedValue - 20, 
              y: height - point.normalizedValue 
            }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="hover:fill-purple-600 transition-colors cursor-pointer"
          />
        ))}
      </svg>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
          <span>Progress</span>
        </div>
      </div>

      <div className="relative">
        {type === 'line' ? renderLineChart() : renderBarChart()}
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500 px-5">
          {chartData.length > 0 && (
            <>
              <span>{chartData[0].label}</span>
              {chartData.length > 2 && (
                <span>{chartData[Math.floor(chartData.length / 2)].label}</span>
              )}
              <span>{chartData[chartData.length - 1].label}</span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {Math.round(chartData.reduce((sum, p) => sum + p.value, 0) / chartData.length)}
            </div>
            <div className="text-xs text-gray-500">Average</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {Math.max(...chartData.map(p => p.value))}
            </div>
            <div className="text-xs text-gray-500">Best</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {chartData.length}
            </div>
            <div className="text-xs text-gray-500">Days</div>
          </div>
        </div>
      )}
    </div>
  )
}