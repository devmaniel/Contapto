import { supabase } from '../../../supabase/supabase-api'
import type { Credits, TransactionInsert, Transaction } from '../../../supabase/types'

// =====================================================
// CREDITS API FUNCTIONS
// =====================================================

/**
 * Get user's current credits balance
 * @param userId - User's UUID from auth
 * @returns Credits object or null if not found
 */
export async function getUserCredits(userId: string): Promise<Credits | null> {
  console.log('💳 Fetching credits for user:', userId)
  
  try {
    const { data, error } = await supabase
      .from('credits')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error) {
      console.error('❌ Error fetching credits:', error)
      throw error
    }

    console.log('✅ Credits fetched:', data)
    return data
  } catch (error) {
    console.error('❌ getUserCredits error:', error)
    return null
  }
}

/**
 * Update user's credits balance
 * @param userId - User's UUID
 * @param newBalance - New credits balance
 * @returns Updated credits object
 */
export async function updateCreditsBalance(
  userId: string,
  newBalance: number
): Promise<Credits | null> {
  console.log('💳 Updating credits balance:', { userId, newBalance })

  try {
    const { data, error } = await supabase
      .from('credits')
      .update({ credits_balance: newBalance })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating credits:', error)
      throw error
    }

    console.log('✅ Credits updated:', data)
    return data
  } catch (error) {
    console.error('❌ updateCreditsBalance error:', error)
    return null
  }
}

/**
 * Add credits to user's balance (increment)
 * @param userId - User's UUID
 * @param creditsToAdd - Amount of credits to add
 * @returns Updated credits object
 */
export async function addCredits(
  userId: string,
  creditsToAdd: number
): Promise<Credits | null> {
  console.log('💳 Adding credits:', { userId, creditsToAdd })

  try {
    // First get current balance
    const currentCredits = await getUserCredits(userId)
    
    if (!currentCredits) {
      console.error('❌ User credits not found, cannot add credits')
      return null
    }

    const newBalance = currentCredits.credits_balance + creditsToAdd
    return await updateCreditsBalance(userId, newBalance)
  } catch (error) {
    console.error('❌ addCredits error:', error)
    return null
  }
}

// =====================================================
// TRANSACTIONS API FUNCTIONS
// =====================================================

/**
 * Create a new transaction record
 * @param transaction - Transaction data to insert
 * @returns Created transaction object
 */
export async function createTransaction(
  transaction: TransactionInsert
): Promise<Transaction | null> {
  console.log('📤 Creating transaction:', transaction)

  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(transaction)
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating transaction:', error)
      throw error
    }

    console.log('✅ Transaction created:', data)
    return data
  } catch (error) {
    console.error('❌ createTransaction error:', error)
    return null
  }
}

/**
 * Update transaction status
 * @param transactionId - Transaction UUID
 * @param status - New status ('pending' | 'completed' | 'failed')
 * @returns Updated transaction object
 */
export async function updateTransactionStatus(
  transactionId: string,
  status: 'pending' | 'completed' | 'failed'
): Promise<Transaction | null> {
  console.log('📤 Updating transaction status:', { transactionId, status })

  try {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', transactionId)
      .select()
      .single()

    if (error) {
      console.error('❌ Error updating transaction:', error)
      throw error
    }

    console.log('✅ Transaction updated:', data)
    return data
  } catch (error) {
    console.error('❌ updateTransactionStatus error:', error)
    return null
  }
}

/**
 * Get user's transaction history
 * @param userId - User's UUID
 * @param limit - Number of transactions to fetch (default: 50)
 * @returns Array of transactions
 */
export async function getUserTransactions(
  userId: string,
  limit = 50
): Promise<Transaction[]> {
  console.log('📤 Fetching transactions for user:', userId)

  try {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('❌ Error fetching transactions:', error)
      throw error
    }

    console.log('✅ Transactions fetched:', data?.length || 0)
    return data || []
  } catch (error) {
    console.error('❌ getUserTransactions error:', error)
    return []
  }
}
