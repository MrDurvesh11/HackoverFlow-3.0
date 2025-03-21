// components/stock-chart.js
"use client"

import { useState } from "react"
import { 
  Area, 
  AreaChart, 
  Bar, 
  BarChart, 
  CartesianGrid, 
  Legend, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts"

export const StockChart = ({ data = [] }) => {
  const [chartType, setChartType] = useState("area")

  // Format data for better display if needed
  const chartData = data.map(item => ({
    ...item,
    price: Number(item.price),
    volume: Number(item.volume)
  }))

  // Calculate min and max for better chart scaling
  const prices = chartData.map(item => item.price).filter(Boolean)
  const minPrice = Math.min(...prices) * 0.95 // 5% buffer below
  const maxPrice = Math.max(...prices) * 1.05 // 5% buffer above

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-end mb-2">
        <div className="flex text-xs bg-muted/30 rounded-md overflow-hidden">
          <button
            className={`px-3 py-1 ${chartType === "area" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setChartType("area")}
          >
            Price
          </button>
          <button
            className={`px-3 py-1 ${chartType === "bar" ? "bg-primary text-primary-foreground" : ""}`}
            onClick={() => setChartType("bar")}
          >
            Volume
          </button>
        </div>
      </div>

      <div className="flex-1">
        {chartType === "area" ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  // Show fewer x-axis labels if we have many data points
                  if (chartData.length > 20) {
                    const idx = chartData.findIndex(item => item.date === val)
                    return idx % 5 === 0 ? val : ''
                  }
                  return val
                }}
              />
              <YAxis 
                domain={[minPrice, maxPrice]}
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => val.toFixed(0)}
              />
              <Tooltip 
                formatter={(value) => ['$' + value.toFixed(2), 'Price']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="#8884d8" 
                fillOpacity={1} 
                fill="url(#colorPrice)" 
                animationDuration={500}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  if (chartData.length > 20) {
                    const idx = chartData.findIndex(item => item.date === val)
                    return idx % 5 === 0 ? val : ''
                  }
                  return val
                }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(val) => {
                  // Format volume with K, M, B suffixes
                  if (val >= 1000000000) return (val / 1000000000).toFixed(1) + 'B'
                  if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M'
                  if (val >= 1000) return (val / 1000).toFixed(1) + 'K'
                  return val
                }}
              />
              <Tooltip 
                formatter={(value) => {
                  if (value >= 1000000000) return [(value / 1000000000).toFixed(2) + 'B', 'Volume']
                  if (value >= 1000000) return [(value / 1000000).toFixed(2) + 'M', 'Volume']
                  if (value >= 1000) return [(value / 1000).toFixed(2) + 'K', 'Volume']
                  return [value, 'Volume']
                }}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Bar 
                dataKey="volume" 
                fill="#82ca9d" 
                animationDuration={500}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      
      {chartData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
          No data available
        </div>
      )}
    </div>
  )
}