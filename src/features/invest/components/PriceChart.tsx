import React from 'react'
import { Button } from '@/shared/components/ui/button'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

interface PriceChartProps {
  selectedTimeframe: string
  onTimeframeChange: (timeframe: string) => void
  data: { time: string; price: number }[]
}

interface TooltipProps {
  active?: boolean
  payload?: Array<{
    value: number
    dataKey: string
  }>
  label?: string
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-gray-400 mb-1">{label}</p>
        <p className="text-sm font-bold text-white">
          ₱{payload[0].value.toLocaleString()}
        </p>
      </div>
    )
  }
  return null
}

const PriceChart: React.FC<PriceChartProps> = ({
  selectedTimeframe,
  onTimeframeChange,
  data,
}) => {
  const timeframes = ['1D', '7D', '1M', '3M', '1Y', 'All']

  return (
    <div className="lg:col-span-2 flex">
      <div className="border border-gray-200 rounded-xl p-6 flex-1 flex flex-col">
        {/* Timeframe Selector */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {timeframes.map((tf) => (
              <Button
                key={tf}
                onClick={() => onTimeframeChange(tf)}
                variant={selectedTimeframe === tf ? 'default' : 'outline'}
                size="sm"
                className={selectedTimeframe === tf ? 'bg-blue-500 hover:bg-blue-600' : ''}
              >
                {tf}
              </Button>
            ))}
          </div>
          <span className="text-xs text-gray-400">Last updated: 2025/10/20 12:28 (UTC+0)</span>
        </div>

        {/* Recharts Line Chart */}
        <div className="w-full flex-1">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                tickLine={false}
                axisLine={{ stroke: '#e5e7eb' }}
                tickFormatter={(value) => `₱${Number(value).toLocaleString()}`}
                domain={[
                  (dataMin: number) => Math.floor(dataMin - 50),
                  (dataMax: number) => Math.ceil(dataMax + 50),
                ]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ef4444', strokeWidth: 1, strokeDasharray: '5 5' }} />
              <Line 
                type="monotone" 
                dataKey="price" 
                stroke="#ef4444" 
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 6, fill: '#ef4444', stroke: '#fff', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default PriceChart
