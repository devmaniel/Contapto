import React, { useEffect, useRef, useState } from 'react'
import { checkSupabaseHealth } from '../../middleware/supabase/CheckSupbaseHealth'
import type { HealthCheckResult } from '../../middleware/supabase/CheckSupbaseHealth'

interface ProviderHealth {
  name: string
  result: HealthCheckResult | null
  checkFunction: () => Promise<HealthCheckResult>
}

const HealthPage = () => {
  const initialProviders = useRef<ProviderHealth[]>([
    {
      name: 'Supabase',
      result: null,
      checkFunction: checkSupabaseHealth
    },
    // Add more providers here as needed
    // Example:
    // {
    //   name: 'External API',
    //   result: null,
    //   checkFunction: checkExternalApiHealth
    // },
  ])

  const [providers, setProviders] = useState<ProviderHealth[]>(initialProviders.current)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const runHealthChecks = async () => {
    setIsChecking(true)
    
    const updatedProviders = await Promise.all(
      initialProviders.current.map(async (provider) => {
        const result = await provider.checkFunction()
        return { ...provider, result }
      })
    )
    
    setProviders(updatedProviders)
    setLastChecked(new Date())
    setIsChecking(false)
  }

  useEffect(() => {
    runHealthChecks()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'unhealthy':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'checking':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return '✓'
      case 'unhealthy':
        return '✗'
      case 'checking':
        return '⟳'
      default:
        return '?'
    }
  }

  const overallStatus = providers.every(p => p.result?.status === 'healthy')
    ? 'healthy'
    : providers.some(p => p.result?.status === 'unhealthy')
    ? 'unhealthy'
    : 'checking'

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">System Health</h1>
          <p className="text-gray-600">Monitor the status of all connected services</p>
        </div>

        {/* Overall Status Card */}
        <div className={`mb-6 p-6 rounded-lg border-2 ${getStatusColor(overallStatus)}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{getStatusIcon(overallStatus)}</span>
              <div>
                <h2 className="text-xl font-semibold">Overall Status</h2>
                <p className="text-sm opacity-80">
                  {overallStatus === 'healthy' && 'All systems operational'}
                  {overallStatus === 'unhealthy' && 'Some systems are experiencing issues'}
                  {overallStatus === 'checking' && 'Checking system status...'}
                </p>
              </div>
            </div>
            <button
              onClick={runHealthChecks}
              disabled={isChecking}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isChecking ? 'Checking...' : 'Refresh'}
            </button>
          </div>
          {lastChecked && (
            <p className="text-xs opacity-70 mt-2">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </div>

        {/* Provider Status Cards */}
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border-2 transition-all ${
                provider.result
                  ? getStatusColor(provider.result.status)
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl flex-shrink-0">
                  {provider.result ? getStatusIcon(provider.result.status) : '⟳'}
                </span>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{provider.name}</h3>
                  
                  {provider.result && (
                    <div className="space-y-1">
                      <p className="text-sm">{provider.result.message}</p>
                      
                      <div className="flex gap-4 text-xs opacity-70 mt-2">
                        {provider.result.responseTime && (
                          <span>Response time: {provider.result.responseTime}ms</span>
                        )}
                        <span>
                          Checked: {new Date(provider.result.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {!provider.result && (
                    <p className="text-sm opacity-70">Checking status...</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Provider Placeholder */}
        <div className="mt-6 p-6 rounded-lg border-2 border-dashed border-gray-300 bg-white">
          <div className="text-center text-gray-500">
            <p className="text-sm">Add more provider health checks here</p>
            <p className="text-xs mt-1 opacity-70">
              Update the providers array in the component to add new services
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HealthPage