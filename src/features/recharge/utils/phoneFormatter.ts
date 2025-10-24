/**
 * Format phone number to display with +63 prefix
 * Handles various input formats: 639xxx, +639xxx, 09xxx, 9xxx
 */
export function formatPhoneNumber(phone: string | undefined): string {
  if (!phone) return 'Loading...'
  
  // Remove any existing + or spaces
  const cleaned = phone.replace(/[\s+]/g, '')
  
  // If starts with 63, add +
  if (cleaned.startsWith('63')) {
    return `+${cleaned}`
  }
  
  // If starts with 0, replace with +63
  if (cleaned.startsWith('0')) {
    return `+63${cleaned.substring(1)}`
  }
  
  // If starts with 9 (no country code), add +63
  if (cleaned.startsWith('9')) {
    return `+63${cleaned}`
  }
  
  // Default: return as is
  return phone
}
