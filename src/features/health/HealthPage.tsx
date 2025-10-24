import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/supabase/supabase-api'
import { checkSupabaseHealth } from '@/middleware/supabase/CheckSupbaseHealth'
import type { HealthCheckResult } from '@/middleware/supabase/CheckSupbaseHealth'
import type { Session } from '@supabase/supabase-js'

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
  ])

  const [providers, setProviders] = useState<ProviderHealth[]>(initialProviders.current)
  const [isChecking, setIsChecking] = useState(false)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [currentTime, setCurrentTime] = useState<Date>(new Date())
  const [session, setSession] = useState<Session | null>(null)
  const [isLoadingAuth, setIsLoadingAuth] = useState(true)

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoadingAuth(true)
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setIsLoadingAuth(false)
    }

    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

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

  // Calculate token expiration
  const getTokenExpiration = () => {
    if (!session?.expires_at) return null
    return new Date(session.expires_at * 1000)
  }

  const getTimeRemaining = () => {
    const expiration = getTokenExpiration()
    if (!expiration) return null

    const diff = expiration.getTime() - currentTime.getTime()
    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)
    return `${minutes}m ${seconds}s`
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">System Health</h1>
          <p className="text-gray-600">Monitor the status of all connected services</p>
        </div>

        {/* JWT Authentication Status Card */}
        <div className={`mb-6 p-6 rounded-lg border-2 ${
          isLoadingAuth 
            ? 'bg-gray-50 border-gray-200' 
            : session 
              ? 'bg-green-50 border-green-200 text-green-900' 
              : 'bg-orange-50 border-orange-200 text-orange-900'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-3xl flex-shrink-0">
              {isLoadingAuth ? '⟳' : session ? '🔒' : '🔓'}
            </span>
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
              
              {isLoadingAuth ? (
                <p className="text-sm">Checking authentication...</p>
              ) : session ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">✓ Authenticated</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3 text-sm">
                    <div className="bg-white/50 p-3 rounded border border-green-300">
                      <p className="font-semibold text-xs uppercase opacity-70 mb-1">User ID</p>
                      <p className="font-mono text-xs break-all">{session.user.id}</p>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded border border-green-300">
                      <p className="font-semibold text-xs uppercase opacity-70 mb-1">Phone</p>
                      <p className="font-mono text-xs">{session.user.phone || 'N/A'}</p>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded border border-green-300">
                      <p className="font-semibold text-xs uppercase opacity-70 mb-1">Current Time</p>
                      <p className="font-mono text-xs">{currentTime.toLocaleString()}</p>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded border border-green-300">
                      <p className="font-semibold text-xs uppercase opacity-70 mb-1">Token Expires At</p>
                      <p className="font-mono text-xs">
                        {getTokenExpiration()?.toLocaleString() || 'N/A'}
                      </p>
                    </div>
                    
                    <div className="bg-white/50 p-3 rounded border border-green-300 md:col-span-2">
                      <p className="font-semibold text-xs uppercase opacity-70 mb-1">Time Remaining</p>
                      <p className="font-mono text-lg font-bold">
                        {getTimeRemaining() || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-green-300">
                    <p className="text-xs opacity-70">
                      JWT Token is active and will auto-refresh before expiration
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm font-medium">✗ Not Authenticated</p>
                  <p className="text-xs opacity-70 mt-2">
                    No active session found. You can still access this health page as it's public.
                  </p>
                  <div className="bg-white/50 p-3 rounded border border-orange-300 mt-3">
                    <p className="font-semibold text-xs uppercase opacity-70 mb-1">Current Time</p>
                    <p className="font-mono text-xs">{currentTime.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
