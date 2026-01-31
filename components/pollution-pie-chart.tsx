'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const pollutionData = [
  { name: 'PM2.5', value: 35, color: '#f59e0b' },
  { name: 'PM10', value: 25, color: '#0ea5e9' },
  { name: 'NO2', value: 20, color: '#0f766e' },
  { name: 'SO2', value: 10, color: '#8b5cf6' },
  { name: 'CO', value: 10, color: '#ef4444' },
]

const renderCustomLabel = (entry: any) => {
  if (!entry || typeof entry.name === 'undefined' || typeof entry.percent === 'undefined') {
    return ''
  }
  return `${entry.name}: ${(entry.percent * 100).toFixed(0)}%`
}

export function PollutionPieChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={pollutionData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderCustomLabel}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
        >
          {pollutionData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
