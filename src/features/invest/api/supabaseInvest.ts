import { supabase } from '../../../supabase/supabase-api'
import type { InvestmentTransactionInsert, InvestmentTransaction } from '../../../supabase/types'

/**
 * Create a new investment transaction record
 */
export async function createInvestmentTransaction(
  transaction: InvestmentTransactionInsert
): Promise<InvestmentTransaction | null> {
  console.log('📤 createInvestmentTransaction: Creating transaction...', transaction)

  const { data, error } = await supabase
    .from('investment_transactions')
    .insert(transaction)
    .select()
    .single()

  if (error) {
    console.error('❌ createInvestmentTransaction: Error creating transaction:', error)
    return null
  }

  console.log('✅ createInvestmentTransaction: Transaction created:', data.id)
  return data
}

/**
 * Get all investment transactions for a user
 */
export async function getUserInvestmentTransactions(
  userId: string
): Promise<InvestmentTransaction[]> {
  console.log('📤 getUserInvestmentTransactions: Fetching transactions for user:', userId)

  const { data, error } = await supabase
    .from('investment_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ getUserInvestmentTransactions: Error fetching transactions:', error)
    return []
  }

  console.log('✅ getUserInvestmentTransactions: Found', data.length, 'transactions')
  return data
}

/**
 * Get a specific investment transaction by ID
 */
export async function getInvestmentTransactionById(
  transactionId: string
): Promise<InvestmentTransaction | null> {
  console.log('📤 getInvestmentTransactionById: Fetching transaction:', transactionId)

  const { data, error } = await supabase
    .from('investment_transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (error) {
    console.error('❌ getInvestmentTransactionById: Error fetching transaction:', error)
    return null
  }

  console.log('✅ getInvestmentTransactionById: Transaction found')
  return data
}

/**
 * Update an investment transaction (e.g., update status, blockchain info)
 */
export async function updateInvestmentTransaction(
  transactionId: string,
  updates: Partial<InvestmentTransaction>
): Promise<InvestmentTransaction | null> {
  console.log('📤 updateInvestmentTransaction: Updating transaction:', transactionId, updates)

  const { data, error } = await supabase
    .from('investment_transactions')
    .update(updates)
    .eq('id', transactionId)
    .select()
    .single()

  if (error) {
    console.error('❌ updateInvestmentTransaction: Error updating transaction:', error)
    return null
  }

  console.log('✅ updateInvestmentTransaction: Transaction updated')
  return data
}

/**
 * Get user's current credits balance
 */
export async function getUserCreditsBalance(userId: string): Promise<number> {
  console.log('📤 getUserCreditsBalance: Fetching credits for user:', userId)

  const { data, error } = await supabase
    .from('credits')
    .select('credits_balance')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('❌ getUserCreditsBalance: Error fetching credits:', error)
    return 0
  }

  console.log('✅ getUserCreditsBalance: Balance:', data.credits_balance)
  return data.credits_balance
}

/**
 * Deduct credits from user's balance (when paying with credits)
 */
export async function deductCredits(
  userId: string,
  amount: number
): Promise<{ success: boolean; newBalance: number }> {
  console.log('📤 deductCredits: Deducting', amount, 'credits from user:', userId)

  // Get current balance
  const currentBalance = await getUserCreditsBalance(userId)

  if (currentBalance < amount) {
    console.error('❌ deductCredits: Insufficient balance')
    return { success: false, newBalance: currentBalance }
  }

  const newBalance = currentBalance - amount

  const { error } = await supabase
    .from('credits')
    .update({ credits_balance: newBalance })
    .eq('user_id', userId)

  if (error) {
    console.error('❌ deductCredits: Error deducting credits:', error)
    return { success: false, newBalance: currentBalance }
  }

  console.log('✅ deductCredits: New balance:', newBalance)
  return { success: true, newBalance }
}
