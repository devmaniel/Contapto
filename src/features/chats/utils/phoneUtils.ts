/**
 * Phone number utility functions for consistent formatting
 */

/**
 * Normalize phone number to match database format
 * Handles: 09xxxxxxxxx, +63xxxxxxxxx, 63xxxxxxxxx
 * Returns the format that matches your database (without + prefix)
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // If starts with +63, remove the +
  if (cleaned.startsWith('+63')) {
    return cleaned.substring(1) // Returns: 63xxxxxxxxx
  }
  
  // If starts with 63, keep as is
  if (cleaned.startsWith('63')) {
    return cleaned // Returns: 63xxxxxxxxx
  }
  
  // If starts with 09, convert to 63 format
  if (cleaned.startsWith('09')) {
    return '63' + cleaned.substring(1) // Returns: 63xxxxxxxxx
  }
  
  // If starts with 9 (missing leading 0), add 63
  if (cleaned.startsWith('9') && cleaned.length === 10) {
    return '63' + cleaned // Returns: 63xxxxxxxxx
  }
  
  // Return as is if no pattern matches
  return cleaned
}

/**
 * Format phone number for display
 * Converts to +63 format for consistency
 */
export function formatPhoneForDisplay(phone: string): string {
  const normalized = normalizePhoneNumber(phone)
  
  // Add + prefix if not present
  if (!normalized.startsWith('+')) {
    return '+' + normalized
  }
  
  return normalized
}

/**
 * Validate Philippine phone number
 * Accepts: 09xxxxxxxxx, +63xxxxxxxxx, 63xxxxxxxxx
 */
export function isValidPhilippinePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Check for valid formats
  const patterns = [
    /^\+639\d{9}$/,  // +639xxxxxxxxx (13 chars)
    /^639\d{9}$/,    // 639xxxxxxxxx (12 chars)
    /^09\d{9}$/      // 09xxxxxxxxx (11 chars)
  ]
  
  return patterns.some(pattern => pattern.test(cleaned))
}

/**
 * Get all possible phone number variants for lookup
 * Returns array of possible formats to check in database
 */
export function getPhoneVariants(phone: string): string[] {
  const normalized = normalizePhoneNumber(phone)
  const variants = new Set<string>()
  
  // Add the normalized version (63xxxxxxxxx)
  variants.add(normalized)
  
  // Add with + prefix
  if (!normalized.startsWith('+')) {
    variants.add('+' + normalized)
  }
  
  // If it's in 63 format, also add 09 format
  if (normalized.startsWith('63')) {
    variants.add('0' + normalized.substring(2))
  }
  
  return Array.from(variants)
}
