import React from 'react'

interface MarketStatsProps {
  high24h: string
  low24h: string
  volume24h: string
  marketCap: string
}

const MarketStats: React.FC<MarketStatsProps> = ({
  high24h,
  low24h,
  volume24h,
  marketCap,
}) => {
  return (
    <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-xl">
      <div>
        <p className="text-xs text-gray-500 mb-1">24h High</p>
        <p className="text-sm font-semibold text-gray-900">{high24h}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">24h Low</p>
        <p className="text-sm font-semibold text-gray-900">{low24h}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">24h Volume</p>
        <p className="text-sm font-semibold text-gray-900">{volume24h}</p>
      </div>
      <div>
        <p className="text-xs text-gray-500 mb-1">Market Cap</p>
        <p className="text-sm font-semibold text-gray-900">{marketCap}</p>
      </div>
    </div>
  )
}

export default MarketStats
