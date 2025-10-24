import { useState, useMemo, useEffect } from 'react'
import { useLoaderData } from '@tanstack/react-router'
import Layout1 from '@/shared/layouts/Layout1'
import ChatSidebar from './components/chats/ChatSidebar'
import ChatMainArea from './components/chats/ChatMainArea'
import NewChatArea from './components/chats/NewChatArea'
import ChatSidebarSkeleton from './components/chats/ChatSidebarSkeleton'
import ChatMainAreaSkeleton from './components/chats/ChatMainAreaSkeleton'
import EmptyStateSkeleton from './components/chats/EmptyStateSkeleton'
import NoPromoDialog from './components/chats/NoPromoDialog'
import ErrorDialog from './components/chats/ErrorDialog'
import IncomingCallDialog from './components/calls/IncomingCallDialog'
import OutgoingCallDialog from './components/calls/OutgoingCallDialog'
import ActiveCallDialog from './components/calls/ActiveCallDialog'
import MinimizedCallBar from './components/calls/MinimizedCallBar'
import { useCurrentUser } from './hooks/useCurrentUser'
import { useConversations } from './hooks/useConversations'
import { useMessages } from './hooks/useMessages'
import { useCall } from './hooks/useCall'
import { conversationToChatPreview, supabaseMessageToUIMessage } from './utils/adapters'
import { normalizePhoneNumber, formatPhoneForDisplay } from './utils/phoneUtils'
import { sendMessage } from './api/supabaseChats'
import { usePromosStore } from '@/shared/stores/usePromosStore'
import { getPromoSummary, deductFromPromos } from '@/features/recharge/api/supabasePromos'
import { supabase } from '@/supabase/supabase-api'
import type { ChatPreview, Message } from './types'
import type { ConversationWithDetails } from './hooks/useConversations'
import type { Message as SupabaseMessage, UserPromo } from '@/supabase/types'

const ChatsIndexPage = () => {
  const loaderData = useLoaderData({ from: '/chats/' }) as { 
    conversations: ConversationWithDetails[]
    firstConversationId: string | null
    firstConversationMessages: SupabaseMessage[]
  }
  const [searchValue, setSearchValue] = useState('')
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null)
  const [draftPhone, setDraftPhone] = useState<string | null>(null)
  const [isDraftValid, setIsDraftValid] = useState<boolean>(false)
  const [isCallMinimized, setIsCallMinimized] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isEndingCall, setIsEndingCall] = useState(false)
  const [showNoPromoDialog, setShowNoPromoDialog] = useState(false)
  const [noPromoType, setNoPromoType] = useState<'text' | 'call'>('text')
  const [showErrorDialog, setShowErrorDialog] = useState(false)
  const [errorType, setErrorType] = useState<'self-message' | 'user-not-found' | 'general'>('general')
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined)

  // Promo store
  const { summary: promoSummary, setSummary, loading: promosLoading, setLoading: setPromosLoading } = usePromosStore()

  const { user, loading: userLoading } = useCurrentUser()

  // Fetch promo summary on mount and when user changes
  useEffect(() => {
    if (!user?.id) return
    
    const fetchPromos = async () => {
      try {
        setPromosLoading(true)
        console.log('🎁 Fetching promo summary for user:', user.id)
        const summary = await getPromoSummary(user.id)
        setSummary(summary)
      } finally {
        setPromosLoading(false)
      }
    }
    
    fetchPromos()
  }, [user?.id, setSummary, setPromosLoading])
  
  const { conversations, loading: conversationsLoading, startConversationWithPhone } = useConversations(
    user?.id || null,
    loaderData?.conversations
  )
  
  const { 
    messages: supabaseMessages, 
    loading: messagesLoading,
    sendNewMessage, 
    markAsRead 
  } = useMessages(selectedChatId, user?.id || null)

  // Call management
  const {
    incomingCall,
    outgoingCall,
    activeCall,
    initiateCall,
    answerCall,
    rejectCall,
    endCall,
    clearCallState,
    error: callError,
  } = useCall(user?.id)

  // Show error alert when call fails
  useEffect(() => {
    if (callError) {
      alert(callError)
    }
  }, [callError])

  // Debug: Log call state changes
  useEffect(() => {
    console.log('📊 Call State:', {
      hasIncoming: !!incomingCall,
      hasOutgoing: !!outgoingCall,
      hasActive: !!activeCall,
      activeStatus: activeCall?.status,
      outgoingStatus: outgoingCall?.status,
      error: callError,
    })
  }, [incomingCall, outgoingCall, activeCall, callError])

  const isInitializing = userLoading || (conversationsLoading && !loaderData?.conversations)

  // Convert Supabase conversations to chat previews
  const chatPreviews = useMemo((): ChatPreview[] => {
    if (!user) return []
    return conversations.map(conv => conversationToChatPreview(conv, user.id))
  }, [conversations, user])

  // Filter chat previews based on search
  const filteredPreviews = useMemo(() => {
    if (!searchValue.trim()) return chatPreviews

    const query = searchValue.toLowerCase()
    return chatPreviews.filter((preview) => 
      preview.phoneOrName.toLowerCase().includes(query) ||
      preview.lastMessageText.toLowerCase().includes(query)
    )
  }, [chatPreviews, searchValue])

  // Get selected conversation data
  const selectedConversation = useMemo(() => {
    if (!selectedChatId) return null
    const conv = conversations.find((conv) => conv.id === selectedChatId)
    console.log('🔍 Selected conversation:', { selectedChatId, found: !!conv, conv })
    return conv
  }, [selectedChatId, conversations])

  useEffect(() => {
    if (draftPhone === null && !selectedChatId && !isInitializing && conversations.length > 0) {
      setSelectedChatId(conversations[0].id)
    }
  }, [draftPhone, selectedChatId, isInitializing, conversations])

  // Convert Supabase messages to UI format
  const messages = useMemo((): Message[] => {
    if (!user) return []
    const converted = supabaseMessages.map(msg => supabaseMessageToUIMessage(msg, user.id))
    console.log('💬 Messages for selected chat:', { count: converted.length, messages: converted })
    return converted
  }, [supabaseMessages, user])

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedChatId && user) {
      markAsRead()
    }
  }, [selectedChatId, user, markAsRead])

  const handleNewChat = () => {
    // Start new chat draft mode
    setDraftPhone('')
    setIsDraftValid(false)
    setSelectedChatId(null)
  }

  const handlePhoneNumberChange = (value: string) => {
    // Store the raw value for display
    setDraftPhone(value)
    
    // Validate the phone number format
    // Valid formats: +639xxxxxxxxx (13 chars) or 09xxxxxxxxx (11 chars)
    const isValid = /^\+63\d{10}$/.test(value) || /^09\d{9}$/.test(value)
    setIsDraftValid(isValid)
  }

  const handleSendMessageToExistingChat = async (messageText: string) => {
    if (!selectedChatId || !user) return

    // Check if user has text promo
    const hasTextPromo = promoSummary.hasUnlimitedText || 
      (promoSummary.textTotal !== null && promoSummary.textUsed < promoSummary.textTotal)
    
    if (!hasTextPromo) {
      console.log('❌ No text promo available')
      setNoPromoType('text')
      setShowNoPromoDialog(true)
      return
    }

    // Add minimum 1.5s delay to show loading state
    console.log('⏳ Sending message with 1.5s minimum loading...')
    const startTime = Date.now()
    
    const { error } = await sendNewMessage(messageText)
    
    // Ensure at least 1.5s has passed for loading indicator visibility
    const elapsed = Date.now() - startTime
    if (elapsed < 1500) {
      await new Promise(resolve => setTimeout(resolve, 1500 - elapsed))
    }
    
    if (error) {
      console.error('Failed to send message:', error)
      setErrorType('general')
      setErrorMessage('Failed to send message. Please try again.')
      setShowErrorDialog(true)
    } else {
      console.log('✅ Message sent after delay')
      
      // Deduct from promo
      const deducted = await deductFromPromos(user.id, 'text', 1)
      if (deducted) {
        console.log('✅ Promo usage deducted')
        // Refresh promo summary
        const updatedSummary = await getPromoSummary(user.id)
        setSummary(updatedSummary)
      } else {
        console.warn('⚠️ Failed to deduct promo usage')
      }
    }
  }

  const handleSendMessage = async (messageText: string) => {
    if (!draftPhone || !isDraftValid || !user) {
      console.warn('⚠️ Cannot send message:', { draftPhone, isDraftValid, hasUser: !!user })
      return
    }

    // Check if user has text promo
    const hasTextPromo = promoSummary.hasUnlimitedText || 
      (promoSummary.textTotal !== null && promoSummary.textUsed < promoSummary.textTotal)
    
    if (!hasTextPromo) {
      console.log('❌ No text promo available')
      setNoPromoType('text')
      setShowNoPromoDialog(true)
      return
    }

    // Normalize phone number using utility function
    const normalizedPhone = normalizePhoneNumber(draftPhone)
    console.log('📞 Starting conversation with phone:', draftPhone, '→ normalized:', normalizedPhone)

    // Check if user is trying to message themselves
    if (user.phone && normalizePhoneNumber(user.phone) === normalizedPhone) {
      console.log('❌ User trying to message themselves')
      setErrorType('self-message')
      setShowErrorDialog(true)
      return
    }

    try {
      // Start or get existing conversation
      const { conversation, error: convError } = await startConversationWithPhone(normalizedPhone)
      
      if (convError) {
        console.error('❌ Failed to start conversation:', convError)
        if (convError.message.includes('different_participants') || convError.message.includes('yourself')) {
          setErrorType('self-message')
        } else {
          setErrorType('general')
          setErrorMessage(convError.message)
        }
        setShowErrorDialog(true)
        return
      }

      if (!conversation) {
        console.error('❌ No conversation created - user not found')
        setErrorType('user-not-found')
        setShowErrorDialog(true)
        return
      }

      console.log('✅ Conversation created/found:', conversation.id)

      // Send the message FIRST using the conversation ID directly
      // Don't wait for state update - that's the bug!
      console.log('📤 Sending message to conversation:', conversation.id)
      
      // Add minimum 1.5s delay to show loading state
      console.log('⏳ Sending message with 1.5s minimum loading...')
      const startTime = Date.now()
      
      const { data: sentMessage, error: sendError } = await sendMessage(
        conversation.id,
        user.id,
        messageText
      )
      
      // Ensure at least 1.5s has passed for loading indicator visibility
      const elapsed = Date.now() - startTime
      if (elapsed < 1500) {
        await new Promise(resolve => setTimeout(resolve, 1500 - elapsed))
      }
      
      if (sendError) {
        console.error('❌ Failed to send message:', sendError)
        setErrorType('general')
        setErrorMessage(sendError.message)
        setShowErrorDialog(true)
        return
      }

      console.log('✅ Message sent successfully:', sentMessage)

      // Deduct from promo
      const deducted = await deductFromPromos(user.id, 'text', 1)
      if (deducted) {
        console.log('✅ Promo usage deducted')
        // Refresh promo summary
        const updatedSummary = await getPromoSummary(user.id)
        setSummary(updatedSummary)
      } else {
        console.warn('⚠️ Failed to deduct promo usage')
      }

      // NOW clear draft mode and switch to the conversation
      // The message is already sent, so switching views is safe
      setDraftPhone(null)
      setIsDraftValid(false)
      setSelectedChatId(conversation.id)
    } catch (err) {
      console.error('❌ Error in handleSendMessage:', err)
      alert('An unexpected error occurred. Please try again.')
    }
  }

  const handleCancelNewChat = () => {
    setDraftPhone(null)
    setIsDraftValid(false)
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
  }

  const handleSelectChat = (chatId: string) => {
    console.log('💬 Selecting chat:', chatId)
    setSelectedChatId(chatId)
    // clear draft when selecting a real chat
    setDraftPhone(null)
    setIsDraftValid(false)
  }

  // Handle initiating a call from ChatMainArea
  const handleInitiateCall = async (receiverPhone: string) => {
    if (!user?.phone) {
      console.error('❌ Cannot initiate call: User phone not available')
      alert('Cannot initiate call. Please ensure you are logged in.')
      return
    }

    // Check if user has call promo
    const hasCallPromo = promoSummary.hasUnlimitedCalls || 
      (promoSummary.callTotal !== null && promoSummary.callUsed < promoSummary.callTotal)
    
    if (!hasCallPromo) {
      console.log('❌ No call promo available')
      setNoPromoType('call')
      setShowNoPromoDialog(true)
      return
    }

    console.log('📞 Initiating call from UI...', { receiverPhone, callerPhone: user.phone })
    
    try {
      setPromosLoading(true)
      console.log('🎁 Refetching promo summary before call initiation')
      
      const { data: allPromos } = await supabase
        .from('user_promos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      console.log('🗄️ ALL promos in database (including expired):', allPromos?.map((p: UserPromo) => ({
        id: p.id,
        promo_id: p.promo_id,
        type: p.promo_type,
        text_allowance: p.text_allowance,
        text_used: p.text_used,
        call_allowance: p.call_allowance,
        call_used: p.call_used,
        is_active: p.is_active,
        expires_at: p.expires_at,
        expired: new Date(p.expires_at) < new Date()
      })))
      
      const freshSummary = await getPromoSummary(user.id)
      setSummary(freshSummary)
      console.log('✅ Fresh promo summary loaded:', freshSummary)
    } catch (err) {
      console.error('❌ Error refetching promos:', err)
    } finally {
      setPromosLoading(false)
    }
    
    await initiateCall(receiverPhone, user.phone)
  }

  // Handle answering incoming call
  const handleAnswerCall = async () => {
    if (!incomingCall || !user) return
    console.log('📞 Answering incoming call:', incomingCall.id)
    
    // Refetch promo summary to ensure fresh data when call becomes active
    try {
      setPromosLoading(true)
      console.log('🎁 Refetching promo summary before answering call')
      
      const freshSummary = await getPromoSummary(user.id)
      setSummary(freshSummary)
      console.log('✅ Fresh promo summary loaded before answer:', freshSummary)
    } catch (err) {
      console.error('❌ Error refetching promos:', err)
    } finally {
      setPromosLoading(false)
    }
    
    await answerCall(incomingCall.id)
  }

  // Handle rejecting incoming call
  const handleRejectCall = async () => {
    if (!incomingCall) return
    console.log('📞 Rejecting incoming call:', incomingCall.id)
    await rejectCall(incomingCall.id)
  }

  // Handle ending active call
  const handleEndCall = async () => {
    if (!activeCall || !user) return
    console.log('📞 Ending active call:', activeCall.id)
    
    setIsCallMinimized(false)
    setIsEndingCall(true)
    
    // Only call API if status is not already 'ended' (to avoid double-calling)
    let actualDurationSeconds = 0
    if (activeCall.status !== 'ended') {
      const result = await endCall(activeCall.id)
      actualDurationSeconds = result.durationSeconds || 0
    }
    
    // Deduct call minutes from promo (caller pays model)
    // Only the CALLER should be charged, regardless of who ends the call
    // Use ACTUAL duration from database timestamps, not local timer
    // EXACT DEDUCTION: Deduct exact seconds used (as decimal minutes), not rounded up
    if (actualDurationSeconds > 0 && user.id === activeCall.caller_uuid) {
      // Convert seconds to minutes with decimal precision (e.g., 10s = 0.167 min)
      const exactMinutes = actualDurationSeconds / 60
      console.log(`📞 Call duration: ${actualDurationSeconds}s (${exactMinutes.toFixed(3)} min)`)
      console.log(`📞 Deducting EXACT ${exactMinutes.toFixed(3)} minute(s) from CALLER promo`)
      console.log(`📞 Example: 10s call = 0.167 min deducted, you keep 0.833 min remaining!`)
      
      const deducted = await deductFromPromos(user.id, 'call', exactMinutes)
      if (deducted) {
        console.log('✅ Call promo usage deducted (caller) - EXACT seconds used!')
        const updatedSummary = await getPromoSummary(user.id)
        setSummary(updatedSummary)
      } else {
        console.warn('⚠️ Failed to deduct caller call promo usage')
      }
    } else if (user.id === activeCall.caller_uuid) {
      console.log('⚠️ No call duration to deduct (call may have ended before being answered)')
    }
    
    // Clear call state after animation completes (3 seconds: 2s message + 1s fade)
    // This ensures both sides see the full animation
    setTimeout(() => {
      clearCallState()
      setIsEndingCall(false)
      setCallDuration(0) // Reset call duration
    }, 3000)
  }

  // Handle ending outgoing call
  const handleEndOutgoingCall = async () => {
    if (!outgoingCall) return
    console.log('📞 Ending outgoing call:', outgoingCall.id)
    await endCall(outgoingCall.id)
  }

  // Track call duration for outgoing calls
  useEffect(() => {
    if (outgoingCall && outgoingCall.status === 'new') {
      setCallDuration(0)
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      setCallDuration(0)
    }
  }, [outgoingCall])

  // Track call duration for active calls
  useEffect(() => {
    if (activeCall && activeCall.status === 'answered') {
      setCallDuration(0)
      const interval = setInterval(() => {
        setCallDuration(prev => prev + 1)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [activeCall])

  const callerRemainingMinutes = useMemo(() => {
    if (!activeCall || user?.id !== activeCall.caller_uuid) {
      console.log('📊 callerRemainingMinutes: null (not caller or no active call)')
      return null
    }
    if (promosLoading) {
      console.log('📊 callerRemainingMinutes: null (promos loading)')
      return null
    }
    if (promoSummary.hasUnlimitedCalls) {
      console.log('📊 callerRemainingMinutes: null (unlimited calls)')
      return null
    }
    if (!promoSummary.activePromos || promoSummary.activePromos.length === 0) {
      console.warn('⚠️ activePromos is empty - treating as unlimited to prevent premature end')
      return null
    }
    console.log('📊 RAW activePromos:', promoSummary.activePromos.map(p => ({
      id: p.id,
      type: p.promo_type,
      text_allowance: p.text_allowance,
      text_used: p.text_used,
      call_allowance: p.call_allowance,
      call_used: p.call_used,
      is_active: p.is_active,
      expires_at: p.expires_at
    })))
    const relevant = promoSummary.activePromos.filter(p =>
      (p.promo_type === 'limited_both' || p.promo_type === 'limited_calls') && p.call_allowance !== null
    )
    console.log('📊 Relevant call promos after filter:', relevant.map(p => ({
      id: p.id,
      type: p.promo_type,
      allowance: p.call_allowance,
      used: p.call_used
    })))
    const total = relevant.reduce((sum, p) => sum + (p.call_allowance || 0), 0)
    const used = relevant.reduce((sum, p) => sum + p.call_used, 0)
    const remaining = total - used
    console.log('📊 Call minutes:', { total, used, remaining })
    
    // Safeguard 1: No call promos found
    if (total === 0) {
      console.warn('⚠️ No call promos found but hasUnlimitedCalls is false - treating as unlimited')
      return null
    }
    
    // Safeguard 2: If remaining is 0 or negative but user clearly has call allowance,
    // there might be stale data from previous call. Treat as unlimited to prevent false auto-end.
    if (remaining <= 0 && total > 0) {
      console.warn('⚠️ SUSPICIOUS: remaining minutes is 0 or negative but total allowance exists', {
        total,
        used,
        remaining,
        warning: 'This might be stale data from previous call. Treating as unlimited to prevent false auto-end.'
      })
      console.warn('⚠️ User has', total, 'minutes allowance but', used, 'already used - treating as fresh promo with full allowance')
      // Return the full total as remaining (assume fresh promo)
      return total
    }
    
    return remaining >= 0 ? remaining : 0
  }, [activeCall, user?.id, promosLoading, promoSummary])

  return (
    <>
      {/* No Promo Dialog */}
      <NoPromoDialog 
        isOpen={showNoPromoDialog}
        onClose={() => setShowNoPromoDialog(false)}
        promoType={noPromoType}
      />

      {/* Error Dialog */}
      <ErrorDialog 
        isOpen={showErrorDialog}
        onClose={() => setShowErrorDialog(false)}
        errorType={errorType}
        errorMessage={errorMessage}
      />

      {/* Incoming Call Dialog */}
      {incomingCall && (
        <IncomingCallDialog 
          callerPhone={formatPhoneForDisplay(incomingCall.caller_phone)}
          onAnswer={handleAnswerCall}
          onDecline={handleRejectCall}
        />
      )}

      {/* Outgoing Call Dialog - Caller waiting for answer */}
      {outgoingCall && outgoingCall.status === 'new' && (
        <OutgoingCallDialog 
          receiverPhone={formatPhoneForDisplay(outgoingCall.receiver_phone)}
          onEndCall={handleEndOutgoingCall}
          callDuration={callDuration}
        />
      )}

      {/* Active Call Dialog - Full screen */}
      {(activeCall || isEndingCall) && (activeCall?.status === 'answered' || activeCall?.status === 'ended' || isEndingCall) && !isCallMinimized && !outgoingCall && (
        <ActiveCallDialog 
          callerPhone={
            activeCall?.caller_uuid === user?.id 
              ? (activeCall?.receiver_phone ? formatPhoneForDisplay(activeCall.receiver_phone) : undefined)
              : (activeCall?.caller_phone ? formatPhoneForDisplay(activeCall.caller_phone) : undefined)
          }
          isCallEnded={activeCall?.status === 'ended'}
          onEndCall={handleEndCall}
          onMinimize={() => setIsCallMinimized(true)}
          callDuration={callDuration}
          remainingMinutes={callerRemainingMinutes}
        />
      )}

      {/* Minimized Call Bar - Above navbar */}
      {activeCall && activeCall.status === 'answered' && isCallMinimized && (
        <MinimizedCallBar 
          callerPhone={
            activeCall.caller_uuid === user?.id 
              ? formatPhoneForDisplay(activeCall.receiver_phone)
              : formatPhoneForDisplay(activeCall.caller_phone)
          }
          timer={0}
          isMuted={false}
          isVolumeHigh={true}
          onToggleMute={() => {}}
          onToggleVolume={() => {}}
          onEndCall={handleEndCall}
          onMaximize={() => setIsCallMinimized(false)}
        />
      )}

      <Layout1>
      
      <div className="flex items-center pt-2 pb-6 h-[calc(100vh-100px)]">
        <div className="w-full h-full flex gap-7">
          {/* Sidebar - Show skeleton only during initialization */}
          {isInitializing && draftPhone === null ? (
            <ChatSidebarSkeleton />
          ) : (
            <ChatSidebar 
              items={filteredPreviews}
              selectedChatId={selectedChatId || undefined}
              onSelectChat={handleSelectChat}
              searchValue={searchValue}
              onSearchChange={handleSearchChange}
              onNewChat={handleNewChat}
            />
          )}

          {/* Main Area - Show skeleton during initialization or when loading messages */}
          {draftPhone !== null ? (
            <NewChatArea 
              phoneNumber={draftPhone}
              onPhoneNumberChange={handlePhoneNumberChange}
              onCancel={handleCancelNewChat}
              isPhoneValid={isDraftValid}
              onSendMessage={handleSendMessage}
            />
          ) : isInitializing ? (
            <EmptyStateSkeleton />
          ) : (messagesLoading && selectedChatId) ? (
            <ChatMainAreaSkeleton />
          ) : (
            <ChatMainArea 
              messages={messages}
              participantName={
                selectedConversation?.other_user?.display_name || 
                (selectedConversation?.other_user?.phone ? formatPhoneForDisplay(selectedConversation.other_user.phone) : undefined)
              }
              participantPhone={selectedConversation?.other_user?.phone}
              hasChats={conversations.length > 0}
              isSelected={selectedChatId !== null}
              onSendMessage={handleSendMessageToExistingChat}
              onInitiateCall={handleInitiateCall}
              currentUserId={user?.id}
              hasCallPromo={promoSummary.hasUnlimitedCalls || (promoSummary.callTotal !== null && promoSummary.callUsed < promoSummary.callTotal)}
            />
          )}
        </div>
      </div>
    </Layout1>
    </>
  )
}

export default ChatsIndexPage
