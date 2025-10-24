import { supabase } from '@/supabase/supabase-api'
import type { CallInsert, CallUpdate, Call } from '@/supabase/types'
import { hasCallPromo } from '@/features/recharge/api/supabasePromos'

/**
 * Broadcast call update to both participants for instant real-time sync
 */
async function broadcastCallUpdate(call: Call) {
  if (!call.caller_uuid || !call.receiver_uuid) return
  
  try {
    // Get all active channels
    const channels = supabase.getChannels()
    
    // Find and broadcast to caller's channel
    const callerChannel = channels.find(ch => ch.topic === `calls:${call.caller_uuid}`)
    if (callerChannel) {
      await callerChannel.send({
        type: 'broadcast',
        event: 'call-update',
        payload: call,
      })
      console.log('⚡ Broadcasted to caller channel')
    }
    
    // Find and broadcast to receiver's channel
    const receiverChannel = channels.find(ch => ch.topic === `calls:${call.receiver_uuid}`)
    if (receiverChannel) {
      await receiverChannel.send({
        type: 'broadcast',
        event: 'call-update',
        payload: call,
      })
      console.log('⚡ Broadcasted to receiver channel')
    }
    
    console.log('⚡ Broadcast complete')
  } catch (error) {
    console.error('❌ Broadcast error:', error)
    // Don't throw - database updates will still propagate via postgres_changes
  }
}

/**
 * Initiate a new call
 * Creates a new call record with status 'new'
 * Validates that caller has active call promo
 */
export async function initiateCall(
  callerUuid: string,
  receiverUuid: string,
  callerPhone: string,
  receiverPhone: string
) {
  console.log('📞 Initiating call...', { callerPhone, receiverPhone })

  // Check if caller has call promo
  const callerHasPromo = await hasCallPromo(callerUuid)
  if (!callerHasPromo) {
    console.error('❌ Caller has no call promo')
    throw new Error('You need an active call promo to make calls. Please purchase a promo first.')
  }

  const callData: CallInsert = {
    caller_uuid: callerUuid,
    receiver_uuid: receiverUuid,
    caller_phone: callerPhone,
    receiver_phone: receiverPhone,
    status: 'new',
  }

  const { data, error } = await supabase
    .from('calls')
    .insert(callData)
    .select()
    .single()

  if (error) {
    console.error('❌ Error initiating call:', error)
    throw error
  }

  console.log('✅ Call initiated:', data)
  
  // Broadcast to both caller and receiver for instant update
  await broadcastCallUpdate(data)
  
  return { call: data }
}

/**
 * Answer an incoming call
 * Updates call status to 'answered' and sets call_started_at timestamp
 * Note: Only caller needs promo (validated in initiateCall)
 * Receiver can answer without promo - caller's promo covers the call
 */
export async function answerCall(callId: string) {
  console.log('📞 Answering call:', callId)

  // No promo check for receiver - caller's promo covers the call
  // This allows anyone to receive calls as long as the caller has promo

  const updateData: CallUpdate = {
    status: 'answered',
    call_started_at: new Date().toISOString(), // Set start time when call is answered
  }

  const { data, error } = await supabase
    .from('calls')
    .update(updateData)
    .eq('id', callId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error answering call:', error)
    throw error
  }

  console.log('✅ Call answered at:', data.call_started_at)
  
  // Broadcast for instant update
  await broadcastCallUpdate(data)

  console.log('✅ Call answered:', data)
  return { call: data }
}

/**
 * Reject an incoming call
 * Updates call status to 'rejected'
 */
export async function rejectCall(callId: string) {
  console.log('📞 Rejecting call:', callId)

  const updateData: CallUpdate = {
    status: 'rejected',
    call_ended_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('calls')
    .update(updateData)
    .eq('id', callId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error rejecting call:', error)
    throw error
  }

  console.log('✅ Call rejected:', data)
  
  // Broadcast for instant update
  await broadcastCallUpdate(data)
  
  return { call: data }
}

/**
 * Mark call as didn't answer (timeout)
 * Updates call status to 'didnt_answer'
 */
export async function missCall(callId: string) {
  console.log('📞 Call missed (timeout):', callId)

  const updateData: CallUpdate = {
    status: 'didnt_answer',
    call_ended_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('calls')
    .update(updateData)
    .eq('id', callId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error marking call as missed:', error)
    throw error
  }

  console.log('✅ Call marked as missed:', data)
  
  // Broadcast for instant update
  await broadcastCallUpdate(data)
  
  return { call: data }
}

/**
 * End an ongoing call
 * Updates call status to 'ended' and calculates actual call duration
 * Returns the call data with calculated duration in seconds
 */
export async function endCall(callId: string) {
  console.log('📞 Ending call:', callId)

  const endTime = new Date()
  const updateData: CallUpdate = {
    status: 'ended',
    call_ended_at: endTime.toISOString(),
  }

  const { data, error } = await supabase
    .from('calls')
    .update(updateData)
    .eq('id', callId)
    .select()
    .single()

  if (error) {
    console.error('❌ Error ending call:', error)
    throw error
  }

  // Calculate actual call duration from timestamps
  let durationSeconds = 0
  if (data.call_started_at && data.call_ended_at) {
    const startTime = new Date(data.call_started_at)
    const endTimeActual = new Date(data.call_ended_at)
    durationSeconds = Math.floor((endTimeActual.getTime() - startTime.getTime()) / 1000)
    console.log('⏱️ Actual call duration:', {
      started: data.call_started_at,
      ended: data.call_ended_at,
      durationSeconds: `${durationSeconds}s`,
      durationMinutes: `${(durationSeconds / 60).toFixed(2)} min`
    })
  } else {
    console.warn('⚠️ Call timestamps missing, cannot calculate duration')
  }

  console.log('✅ Call ended:', data)
  
  // Broadcast for instant update
  await broadcastCallUpdate(data)
  
  return { call: data, durationSeconds }
}

/**
 * Get profile by phone number
 * Used to find receiver UUID before initiating call
 */
export async function getProfileByPhone(phone: string) {
  console.log('🔍 Looking up profile by phone:', phone)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('phone', phone)
    .single()

  if (error) {
    console.error('❌ Profile not found:', error)
    return { profile: null, error }
  }

  console.log('✅ Profile found:', data)
  return { profile: data, error: null }
}

/**
 * Get active call for user
 * Returns the most recent call that is 'new' or 'answered'
 */
export async function getActiveCall(userId: string) {
  console.log('🔍 Getting active call for user:', userId)

  const { data, error } = await supabase
    .from('calls')
    .select('*')
    .or(`caller_uuid.eq.${userId},receiver_uuid.eq.${userId}`)
    .in('status', ['new', 'answered'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('❌ Error getting active call:', error)
    throw error
  }

  console.log('✅ Active call:', data)
  return { call: data }
}
