import { supabase } from '../../../supabase/supabase-api'
import type { UserPromo, UserPromoInsert, TransactionInsert } from '../../../supabase/types'
import { getUserCredits, updateCreditsBalance, createTransaction } from './supabaseRecharge'

// =====================================================
// PROMO PURCHASE API
// =====================================================

export interface PurchasePromoParams {
  userId: string
  promoId: string
  promoName: string
  promoType: 'unlimited_both' | 'unlimited_text' | 'unlimited_calls' | 'limited_both' | 'limited_text' | 'limited_calls'
  textAllowance: number | null
  callAllowance: number | null
  creditsCost: number
  expiresAt: Date
}

export interface PurchasePromoResult {
  success: boolean
  promo?: UserPromo
  error?: string
  remainingCredits?: number
}

/**
 * Purchase a promo - deducts credits and creates/stacks promo record
 * For limited promos: stacks allowances if same promo_id exists
 * For unlimited promos: creates new record (doesn't stack)
 */
export async function purchasePromo(params: PurchasePromoParams): Promise<PurchasePromoResult> {
  console.log('🎁 Purchasing promo:', params)
  
  try {
    // 1. Get current credits balance
    const currentCredits = await getUserCredits(params.userId)
    
    if (!currentCredits) {
      return {
        success: false,
        error: 'Could not fetch credits balance'
      }
    }
    
    // 2. Check sufficient balance
    if (currentCredits.credits_balance < params.creditsCost) {
      const shortfall = params.creditsCost - currentCredits.credits_balance
      return {
        success: false,
        error: `Insufficient credits. You need ${shortfall} more credits.`
      }
    }
    
    // 3. Deduct credits
    const newBalance = currentCredits.credits_balance - params.creditsCost
    const updatedCredits = await updateCreditsBalance(params.userId, newBalance)
    
    if (!updatedCredits) {
      return {
        success: false,
        error: 'Failed to deduct credits'
      }
    }
    
    // 4. Check if user already has this promo active (for stacking limited promos)
    const isLimitedPromo = params.promoType.startsWith('limited')
    let promo: UserPromo | null = null
    
    if (isLimitedPromo) {
      // Check for existing active promo with same promo_id
      const { data: existingPromo } = await supabase
        .from('user_promos')
        .select('*')
        .eq('user_id', params.userId)
        .eq('promo_id', params.promoId)
        .eq('is_active', true)
        .gt('expires_at', new Date().toISOString())
        .single()
      
      if (existingPromo) {
        console.log('📦 Stacking allowances to existing promo:', existingPromo.id)
        
        // Stack the allowances
        const newTextAllowance = (existingPromo.text_allowance || 0) + (params.textAllowance || 0)
        const newCallAllowance = (existingPromo.call_allowance || 0) + (params.callAllowance || 0)
        const newCreditsPaid = existingPromo.credits_paid + params.creditsCost
        
        const { data: updatedPromo, error: updateError } = await supabase
          .from('user_promos')
          .update({
            text_allowance: newTextAllowance > 0 ? newTextAllowance : null,
            call_allowance: newCallAllowance > 0 ? newCallAllowance : null,
            credits_paid: newCreditsPaid
          })
          .eq('id', existingPromo.id)
          .select()
          .single()
        
        if (updateError) {
          console.error('❌ Error stacking promo:', updateError)
          // Refund credits
          await updateCreditsBalance(params.userId, currentCredits.credits_balance)
          return {
            success: false,
            error: 'Failed to stack promo. Credits refunded.'
          }
        }
        
        promo = updatedPromo
        console.log('✅ Promo stacked successfully:', promo)
      }
    }
    
    // 5. If no existing promo to stack (or unlimited promo), create new record
    if (!promo) {
      const promoInsert: UserPromoInsert = {
        user_id: params.userId,
        promo_id: params.promoId,
        promo_name: params.promoName,
        promo_type: params.promoType,
        text_allowance: params.textAllowance,
        text_used: 0,
        call_allowance: params.callAllowance,
        call_used: 0,
        credits_paid: params.creditsCost,
        expires_at: params.expiresAt.toISOString(),
        is_active: true
      }
      
      const { data: newPromo, error: promoError } = await supabase
        .from('user_promos')
        .insert(promoInsert)
        .select()
        .single()
      
      if (promoError) {
        console.error('❌ Error creating promo:', promoError)
        // Try to refund credits
        await updateCreditsBalance(params.userId, currentCredits.credits_balance)
        return {
          success: false,
          error: 'Failed to activate promo. Credits refunded.'
        }
      }
      
      promo = newPromo
      console.log('✅ Promo purchased successfully:', promo)
    }
    
    // 6. Ensure promo was created/updated
    if (!promo) {
      console.error('❌ No promo record after purchase/stack')
      await updateCreditsBalance(params.userId, currentCredits.credits_balance)
      return {
        success: false,
        error: 'Failed to create/update promo. Credits refunded.'
      }
    }
    
    // 7. Create transaction record
    const transaction: TransactionInsert = {
      user_id: params.userId,
      transaction_type: 'promo_purchase',
      credits_amount: -params.creditsCost,
      status: 'completed',
      metadata: {
        promo_id: params.promoId,
        promo_name: params.promoName,
        user_promo_id: promo.id
      }
    }
    
    await createTransaction(transaction)
    
    return {
      success: true,
      promo,
      remainingCredits: newBalance
    }
  } catch (error) {
    console.error('❌ purchasePromo error:', error)
    return {
      success: false,
      error: 'An unexpected error occurred'
    }
  }
}

// =====================================================
// PROMO RETRIEVAL API
// =====================================================

export interface PromoSummary {
  hasUnlimitedText: boolean
  hasUnlimitedCalls: boolean
  textUsed: number
  textTotal: number | null // null means unlimited
  callUsed: number // in minutes
  callTotal: number | null // in minutes, null means unlimited
  activePromos: UserPromo[]
}

/**
 * Get all active promos for a user
 */
export async function getActivePromos(userId: string): Promise<UserPromo[]> {
  console.log('🎁 Fetching active promos for user:', userId)
  
  try {
    // First expire old promos
    await expireOldPromos(userId)
    
    const { data, error } = await supabase
      .from('user_promos')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .gt('expires_at', new Date().toISOString())
      .order('expires_at', { ascending: true })
    
    if (error) {
      console.error('❌ Error fetching active promos:', error)
      return []
    }
    
    console.log('✅ Active promos fetched:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ getActivePromos error:', error)
    return []
  }
}

/**
 * Get aggregated promo summary for navbar display
 */
export async function getPromoSummary(userId: string): Promise<PromoSummary> {
  console.log('🎁 Getting promo summary for user:', userId)
  
  const promos = await getActivePromos(userId)
  
  const summary: PromoSummary = {
    hasUnlimitedText: false,
    hasUnlimitedCalls: false,
    textUsed: 0,
    textTotal: null,
    callUsed: 0,
    callTotal: null,
    activePromos: promos
  }
  
  // Check for unlimited promos
  const hasUnlimitedText = promos.some(p => 
    p.promo_type === 'unlimited_both' || p.promo_type === 'unlimited_text'
  )
  const hasUnlimitedCalls = promos.some(p => 
    p.promo_type === 'unlimited_both' || p.promo_type === 'unlimited_calls'
  )
  
  summary.hasUnlimitedText = hasUnlimitedText
  summary.hasUnlimitedCalls = hasUnlimitedCalls
  
  // If unlimited, we don't need to calculate totals
  if (hasUnlimitedText) {
    summary.textTotal = null
  } else {
    // Sum up all limited text allowances
    const textPromos = promos.filter(p => 
      (p.promo_type === 'limited_both' || p.promo_type === 'limited_text') && 
      p.text_allowance !== null
    )
    summary.textTotal = textPromos.reduce((sum, p) => sum + (p.text_allowance || 0), 0)
    summary.textUsed = textPromos.reduce((sum, p) => sum + p.text_used, 0)
  }
  
  if (hasUnlimitedCalls) {
    summary.callTotal = null
  } else {
    // Sum up all limited call allowances
    const callPromos = promos.filter(p => 
      (p.promo_type === 'limited_both' || p.promo_type === 'limited_calls') && 
      p.call_allowance !== null
    )
    summary.callTotal = callPromos.reduce((sum, p) => sum + (p.call_allowance || 0), 0)
    summary.callUsed = callPromos.reduce((sum, p) => sum + p.call_used, 0)
  }
  
  console.log('✅ Promo summary:', summary)
  return summary
}

// =====================================================
// PROMO USAGE TRACKING API
// =====================================================

/**
 * Update promo usage (increment text or call usage)
 */
export async function updatePromoUsage(
  promoId: string,
  textIncrement?: number,
  callIncrement?: number
): Promise<boolean> {
  console.log('🎁 Updating promo usage:', { promoId, textIncrement, callIncrement })
  
  try {
    // Get current promo
    const { data: promo, error: fetchError } = await supabase
      .from('user_promos')
      .select('*')
      .eq('id', promoId)
      .single()
    
    if (fetchError || !promo) {
      console.error('❌ Error fetching promo:', fetchError)
      return false
    }
    
    // Calculate new usage
    const newTextUsed = promo.text_used + (textIncrement || 0)
    const newCallUsed = promo.call_used + (callIncrement || 0)
    
    // NOTE: We don't deactivate promos when allowances are consumed
    // Promos stay active until they expire (handled by expireOldPromos function)
    // This allows users to stack more allowances even after using all current allowances
    
    // Update promo usage (keep is_active unchanged)
    const { error: updateError } = await supabase
      .from('user_promos')
      .update({
        text_used: newTextUsed,
        call_used: newCallUsed
        // is_active stays the same - only expires_at determines if promo is active
      })
      .eq('id', promoId)
    
    if (updateError) {
      console.error('❌ Error updating promo usage:', updateError)
      return false
    }
    
    console.log('✅ Promo usage updated')
    return true
  } catch (error) {
    console.error('❌ updatePromoUsage error:', error)
    return false
  }
}

/**
 * Deduct usage from user's active promos (for text/call)
 * Uses stacking logic: deduct from limited promos first, expiring soonest first
 */
export async function deductFromPromos(
  userId: string,
  type: 'text' | 'call',
  amount: number = 1
): Promise<boolean> {
  console.log(`🎁 Deducting ${amount} ${type} from user promos:`, userId)
  
  const promos = await getActivePromos(userId)
  
  // Filter relevant promos
  const relevantPromos = promos.filter(p => {
    if (type === 'text') {
      return p.promo_type === 'unlimited_both' || 
             p.promo_type === 'unlimited_text' || 
             p.promo_type === 'limited_both' || 
             p.promo_type === 'limited_text'
    } else {
      return p.promo_type === 'unlimited_both' || 
             p.promo_type === 'unlimited_calls' || 
             p.promo_type === 'limited_both' || 
             p.promo_type === 'limited_calls'
    }
  })
  
  if (relevantPromos.length === 0) {
    console.log('❌ No active promos for', type)
    return false
  }
  
  // Check for unlimited promo
  const hasUnlimited = relevantPromos.some(p => 
    p.promo_type === 'unlimited_both' || 
    (type === 'text' && p.promo_type === 'unlimited_text') ||
    (type === 'call' && p.promo_type === 'unlimited_calls')
  )
  
  if (hasUnlimited) {
    console.log('✅ User has unlimited', type)
    return true
  }
  
  // Sort limited promos by expiration (soonest first)
  const limitedPromos = relevantPromos
    .filter(p => p.promo_type.startsWith('limited'))
    .sort((a, b) => new Date(a.expires_at).getTime() - new Date(b.expires_at).getTime())
  
  // Deduct from first promo with remaining allowance
  for (const promo of limitedPromos) {
    if (type === 'text') {
      if (promo.text_allowance !== null && promo.text_used < promo.text_allowance) {
        await updatePromoUsage(promo.id, amount, 0)
        return true
      }
    } else {
      if (promo.call_allowance !== null && promo.call_used < promo.call_allowance) {
        await updatePromoUsage(promo.id, 0, amount)
        return true
      }
    }
  }
  
  console.log('❌ No remaining allowance for', type)
  return false
}

// =====================================================
// PROMO VALIDATION API
// =====================================================

/**
 * Check if user has available call promo (unlimited or limited with remaining allowance)
 */
export async function hasCallPromo(userId: string): Promise<boolean> {
  console.log('📞 Checking if user has call promo:', userId)
  
  const summary = await getPromoSummary(userId)
  
  // Has unlimited calls
  if (summary.hasUnlimitedCalls) {
    console.log('✅ User has unlimited calls')
    return true
  }
  
  // Has limited calls with remaining allowance
  if (summary.callTotal !== null && summary.callUsed < summary.callTotal) {
    console.log('✅ User has limited calls:', `${summary.callUsed}/${summary.callTotal}`)
    return true
  }
  
  console.log('❌ User has no call promo')
  return false
}

/**
 * Check if user has available text promo (unlimited or limited with remaining allowance)
 */
export async function hasTextPromo(userId: string): Promise<boolean> {
  console.log('💬 Checking if user has text promo:', userId)
  
  const summary = await getPromoSummary(userId)
  
  // Has unlimited text
  if (summary.hasUnlimitedText) {
    console.log('✅ User has unlimited text')
    return true
  }
  
  // Has limited text with remaining allowance
  if (summary.textTotal !== null && summary.textUsed < summary.textTotal) {
    console.log('✅ User has limited text:', `${summary.textUsed}/${summary.textTotal}`)
    return true
  }
  
  console.log('❌ User has no text promo')
  return false
}

// =====================================================
// PROMO EXPIRATION API
// =====================================================

/**
 * Expire old promos for a user
 */
export async function expireOldPromos(userId: string): Promise<void> {
  console.log('🎁 Expiring old promos for user:', userId)
  
  try {
    const { error } = await supabase
      .from('user_promos')
      .update({ is_active: false })
      .eq('user_id', userId)
      .eq('is_active', true)
      .lt('expires_at', new Date().toISOString())
    
    if (error) {
      console.error('❌ Error expiring promos:', error)
    } else {
      console.log('✅ Old promos expired')
    }
  } catch (error) {
    console.error('❌ expireOldPromos error:', error)
  }
}
