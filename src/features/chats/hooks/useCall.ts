import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/supabase/supabase-api'
import type { Call } from '@/supabase/types'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { 
  initiateCall as initiateCallAPI, 
  answerCall as answerCallAPI,
  rejectCall as rejectCallAPI,
  endCall as endCallAPI,
  missCall as missCallAPI,
  getActiveCall,
  getProfileByPhone
} from '../api/supabaseCalls'

interface UseCallReturn {
  activeCall: Call | null
  incomingCall: Call | null
  outgoingCall: Call | null
  loading: boolean
  error: string | null
  initiateCall: (receiverPhone: string, callerPhone: string) => Promise<void>
  answerCall: (callId: string) => Promise<void>
  rejectCall: (callId: string) => Promise<void>
  endCall: (callId: string) => Promise<{ call: Call | null, durationSeconds: number }>
  clearCallState: () => void
}

/**
 * Hook to manage call state with real-time updates
 * Listens for incoming calls and manages call lifecycle
 */
export function useCall(userId: string | undefined): UseCallReturn {
  const [activeCall, setActiveCall] = useState<Call | null>(null)
  const [incomingCall, setIncomingCall] = useState<Call | null>(null)
  const [outgoingCall, setOutgoingCall] = useState<Call | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch active call on mount
  useEffect(() => {
    if (!userId) return

    const fetchActiveCall = async () => {
      try {
        const { call } = await getActiveCall(userId)
        if (call) {
          setActiveCall(call)
          // Determine if incoming or outgoing
          if (call.receiver_uuid === userId && call.status === 'new') {
            setIncomingCall(call)
          } else if (call.caller_uuid === userId) {
            setOutgoingCall(call)
          }
        }
      } catch (err) {
        console.error('Error fetching active call:', err)
      }
    }

    fetchActiveCall()
  }, [userId])

  // Helper function to handle call updates (used by both broadcast and postgres_changes)
  const handleCallUpdate = useCallback((updatedCall: Call) => {
    console.log('🔄 handleCallUpdate called:', {
      status: updatedCall.status,
      callId: updatedCall.id,
      isReceiver: updatedCall.receiver_uuid === userId,
      isCaller: updatedCall.caller_uuid === userId,
    })

    // Update activeCall state
    setActiveCall(prevCall => {
      // If same call and same status, skip duplicate update
      if (prevCall?.id === updatedCall.id && prevCall?.status === updatedCall.status) {
        console.log('⏭️ Skipping duplicate update - same status:', updatedCall.status)
        return prevCall
      }
      return updatedCall
    })

    // Clear incoming/outgoing based on status
    if (updatedCall.status === 'answered') {
      console.log('✅ Call answered - setting active call, clearing incoming/outgoing')
      // Call is now active
      if (updatedCall.receiver_uuid === userId) {
        console.log('  → Clearing incoming call (I am receiver)')
        setIncomingCall(null)
      } else {
        console.log('  → Clearing outgoing call (I am caller)')
        setOutgoingCall(null)
      }
    } else if (updatedCall.status === 'rejected' || updatedCall.status === 'didnt_answer') {
      console.log('❌ Call rejected/missed - clearing all')
      // Call was rejected or missed - clear immediately
      setActiveCall(null)
      setIncomingCall(null)
      setOutgoingCall(null)
    } else if (updatedCall.status === 'ended') {
      console.log('📞 Call ended - keeping activeCall for end animation')
      // Call ended - keep activeCall so UI can show end message
      // UI will clear it after animation completes
      setIncomingCall(null)
      setOutgoingCall(null)
    }
  }, [userId])

  // Subscribe to real-time call updates using BOTH broadcast (instant) and postgres_changes (reliable)
  useEffect(() => {
    if (!userId) return

    console.log('🔔 Setting up real-time call listener for user:', userId)

    const channel = supabase
      .channel(`calls:${userId}`, {
        config: {
          broadcast: { self: true }, // Receive own broadcasts
        },
      })
      // BROADCAST - Instant updates (no database delay)
      .on(
        'broadcast',
        { event: 'call-update' },
        (payload) => {
          console.log('⚡ Broadcast call update:', payload.payload)
          const callData = payload.payload as Call
          
          // Only process if this call involves the current user
          if (
            callData.caller_uuid === userId ||
            callData.receiver_uuid === userId
          ) {
            handleCallUpdate(callData)
          }
        }
      )
      // POSTGRES CHANGES - Fallback for reliability
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `receiver_uuid=eq.${userId}`,
        },
        (payload: RealtimePostgresChangesPayload<Call>) => {
          console.log('📞 Incoming call detected (DB):', payload.new)
          const newCall = payload.new as Call
          
          if (newCall.status === 'new') {
            setIncomingCall(newCall)
            setActiveCall(newCall)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'calls',
        },
        (payload: RealtimePostgresChangesPayload<Call>) => {
          console.log('📞 Call status updated (DB):', payload.new)
          const updatedCall = payload.new as Call
          
          // Only update if this call involves the current user
          if (
            updatedCall.caller_uuid === userId ||
            updatedCall.receiver_uuid === userId
          ) {
            handleCallUpdate(updatedCall)
          }
        }
      )
      .subscribe()

    return () => {
      console.log('🔕 Cleaning up call listener')
      supabase.removeChannel(channel)
    }
  }, [userId, handleCallUpdate])

  // Auto-timeout for outgoing calls (60 seconds / 1 minute)
  useEffect(() => {
    if (!outgoingCall || outgoingCall.status !== 'new') return

    console.log('⏱️ Starting 60-second timeout for outgoing call:', outgoingCall.id)

    const timeout = setTimeout(async () => {
      console.log('⏱️ Call timeout reached - marking as didnt_answer')
      try {
        await missCallAPI(outgoingCall.id)
        setOutgoingCall(null)
        setActiveCall(null)
      } catch (err) {
        console.error('❌ Error marking call as missed:', err)
      }
    }, 60000) // 60 seconds (1 minute)

    return () => {
      console.log('⏱️ Clearing timeout for outgoing call')
      clearTimeout(timeout)
    }
  }, [outgoingCall])

  // Initiate a new call
  const initiateCall = async (receiverPhone: string, callerPhone: string) => {
    if (!userId) {
      setError('User not authenticated')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // First, get receiver's UUID from phone number
      const { profile, error: profileError } = await getProfileByPhone(receiverPhone)

      if (profileError || !profile) {
        setError('User not found with phone: ' + receiverPhone)
        setLoading(false)
        return
      }

      // Initiate the call
      const { call } = await initiateCallAPI(
        userId,
        profile.id,
        callerPhone,
        receiverPhone
      )

      setOutgoingCall(call)
      setActiveCall(call)
      console.log('✅ Call initiated successfully')
    } catch (err: unknown) {
      console.error('❌ Error initiating call:', err)
      setError(err instanceof Error ? err.message : 'Failed to initiate call')
    } finally {
      setLoading(false)
    }
  }

  // Answer an incoming call
  const answerCall = async (callId: string) => {
    setLoading(true)
    setError(null)

    try {
      const { call } = await answerCallAPI(callId)
      console.log('✅ Call answered successfully - received call object:', {
        id: call.id,
        status: call.status,
        caller_uuid: call.caller_uuid,
        receiver_uuid: call.receiver_uuid,
      })
      setActiveCall(call)
      setIncomingCall(null)
    } catch (err: unknown) {
      console.error('❌ Error answering call:', err)
      setError(err instanceof Error ? err.message : 'Failed to answer call')
    } finally {
      setLoading(false)
    }
  }

  // Reject an incoming call
  const rejectCall = async (callId: string) => {
    setLoading(true)
    setError(null)

    try {
      await rejectCallAPI(callId)
      setActiveCall(null)
      setIncomingCall(null)
      console.log('✅ Call rejected successfully')
    } catch (err: unknown) {
      console.error('❌ Error rejecting call:', err)
      setError(err instanceof Error ? err.message : 'Failed to reject call')
    } finally {
      setLoading(false)
    }
  }

  // End an active call
  const endCall = async (callId: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await endCallAPI(callId)
      setActiveCall(null)
      setIncomingCall(null)
      setOutgoingCall(null)
      console.log('✅ Call ended successfully')
      return result // Return the result including durationSeconds
    } catch (err: unknown) {
      console.error('❌ Error ending call:', err)
      setError(err instanceof Error ? err.message : 'Failed to end call')
      return { call: null, durationSeconds: 0 }
    } finally {
      setLoading(false)
    }
  }

  // Clear all call state (used after end animation completes)
  const clearCallState = () => {
    console.log('🧹 Clearing call state')
    setActiveCall(null)
    setIncomingCall(null)
    setOutgoingCall(null)
  }

  return {
    activeCall,
    incomingCall,
    outgoingCall,
    loading,
    error,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    clearCallState,
  }
}
