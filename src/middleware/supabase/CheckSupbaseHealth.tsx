import { supabase } from '../../supabase/supabase-api'

export interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'checking'
  message: string
  responseTime?: number
  timestamp: string
}

export const checkSupabaseHealth = async (): Promise<HealthCheckResult> => {
  const startTime = performance.now()
  
  try {
    const { error } = await supabase.auth.getSession()
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    
    if (error) {
      return {
        status: 'unhealthy',
        message: `Connection failed: ${error.message}`,
        responseTime,
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      status: 'healthy',
      message: 'Supabase is connected and responding',
      responseTime,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    const endTime = performance.now()
    const responseTime = Math.round(endTime - startTime)
    
    return {
      status: 'unhealthy',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      responseTime,
      timestamp: new Date().toISOString()
    }
  }
}