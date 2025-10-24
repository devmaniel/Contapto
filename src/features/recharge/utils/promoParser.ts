/**
 * Promo Parser Utility
 * Parses promo data to determine type, allowances, and expiration
 */

export interface ParsedPromo {
  promoType: 'unlimited_both' | 'unlimited_text' | 'unlimited_calls' | 'limited_both' | 'limited_text' | 'limited_calls'
  textAllowance: number | null
  callAllowance: number | null // in minutes
  durationDays: number
}

/**
 * Parse promo details from promo ID and description
 */
export function parsePromoDetails(promoId: string, description: string): ParsedPromo {
  // Determine promo type and allowances based on promo ID
  switch (promoId) {
    case 'test-promo':
      // 5 Text Messages (SMS) & 1 Minute of Voice Call for 1 Day
      return {
        promoType: 'limited_both',
        textAllowance: 5,
        callAllowance: 1,
        durationDays: 1
      }
    
    case 'the-180':
      // Unlimited Text (SMS) & Voice Calls, shareable with one number, for 15 Days
      return {
        promoType: 'unlimited_both',
        textAllowance: null,
        callAllowance: null,
        durationDays: 15
      }
    
    case 'voice-value-60':
      // 4,000 Minutes of Voice Calls for 60 Days
      return {
        promoType: 'limited_calls',
        textAllowance: null,
        callAllowance: 4000,
        durationDays: 60
      }
    
    case '15-day-unli':
      // Unlimited Text (SMS) & Voice Calls for 15 Days
      return {
        promoType: 'unlimited_both',
        textAllowance: null,
        callAllowance: null,
        durationDays: 15
      }
    
    case 'the-weekender':
      // Unlimited Text (SMS) & Voice Calls for 7 Days
      return {
        promoType: 'unlimited_both',
        textAllowance: null,
        callAllowance: null,
        durationDays: 7
      }
    
    case 'monthly-basic':
      // Unlimited Text (SMS) to all networks for 30 Days
      return {
        promoType: 'unlimited_text',
        textAllowance: null,
        callAllowance: null,
        durationDays: 30
      }
    
    case 'call-centric':
      // 2,000 Minutes of Voice Calls for 30 Days
      return {
        promoType: 'limited_calls',
        textAllowance: null,
        callAllowance: 2000,
        durationDays: 30
      }
    
    case 'micro-pack':
      // 500 Text Messages (SMS) & 100 Minutes of Voice Calls for 3 Days
      return {
        promoType: 'limited_both',
        textAllowance: 500,
        callAllowance: 100,
        durationDays: 3
      }
    
    case 'late-night':
      // Unlimited Voice Calls (10 PM - 6 AM only) for 30 Days
      // Treating as unlimited for now
      return {
        promoType: 'unlimited_calls',
        textAllowance: null,
        callAllowance: null,
        durationDays: 30
      }
    
    default:
      // Fallback: try to parse from description
      return parseFromDescription(description)
  }
}

/**
 * Fallback parser that extracts info from description text
 */
function parseFromDescription(description: string): ParsedPromo {
  const lowerDesc = description.toLowerCase()
  
  // Extract duration
  let durationDays = 30 // default
  const dayMatch = lowerDesc.match(/(\d+)\s*days?/)
  if (dayMatch) {
    durationDays = parseInt(dayMatch[1])
  }
  
  // Check for unlimited
  const hasUnlimitedText = lowerDesc.includes('unlimited text') || lowerDesc.includes('unlimited sms')
  const hasUnlimitedCalls = lowerDesc.includes('unlimited voice') || lowerDesc.includes('unlimited calls')
  
  // Extract limited amounts
  let textAllowance: number | null = null
  let callAllowance: number | null = null
  
  const textMatch = lowerDesc.match(/(\d+)\s*text/)
  if (textMatch && !hasUnlimitedText) {
    textAllowance = parseInt(textMatch[1])
  }
  
  const callMatch = lowerDesc.match(/(\d+)\s*minutes/)
  if (callMatch && !hasUnlimitedCalls) {
    callAllowance = parseInt(callMatch[1])
  }
  
  // Determine promo type
  let promoType: ParsedPromo['promoType']
  
  if (hasUnlimitedText && hasUnlimitedCalls) {
    promoType = 'unlimited_both'
  } else if (hasUnlimitedText && !hasUnlimitedCalls) {
    if (callAllowance !== null) {
      promoType = 'limited_both'
    } else {
      promoType = 'unlimited_text'
    }
  } else if (!hasUnlimitedText && hasUnlimitedCalls) {
    if (textAllowance !== null) {
      promoType = 'limited_both'
    } else {
      promoType = 'unlimited_calls'
    }
  } else if (textAllowance !== null && callAllowance !== null) {
    promoType = 'limited_both'
  } else if (textAllowance !== null) {
    promoType = 'limited_text'
  } else if (callAllowance !== null) {
    promoType = 'limited_calls'
  } else {
    // Default to unlimited both if can't determine
    promoType = 'unlimited_both'
  }
  
  return {
    promoType,
    textAllowance,
    callAllowance,
    durationDays
  }
}

/**
 * Calculate expiration date from now + duration days
 */
export function calculateExpirationDate(durationDays: number): Date {
  const now = new Date()
  const expiresAt = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000)
  return expiresAt
}

/**
 * Format minutes to human-readable string
 * @param minutes - Total minutes
 * @returns Formatted string like "100m" or "3h 20m" or "200h"
 */
export function formatMinutes(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  }
  
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  
  if (remainingMinutes === 0) {
    return `${hours}h`
  }
  
  return `${hours}h ${remainingMinutes}m`
}
