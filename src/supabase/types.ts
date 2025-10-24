// Supabase Database Types
export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant1_id: string
          participant2_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant1_id?: string
          participant2_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          message_item: string
          date: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          message_item: string
          date?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          message_item?: string
          date?: string
          is_read?: boolean
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          phone: string
          display_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          phone: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          phone?: string
          display_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      calls: {
        Row: {
          id: string
          caller_uuid: string | null
          receiver_uuid: string | null
          caller_phone: string
          receiver_phone: string
          status: 'new' | 'answered' | 'rejected' | 'didnt_answer' | 'ended'
          call_started_at: string
          call_ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          caller_uuid?: string | null
          receiver_uuid?: string | null
          caller_phone: string
          receiver_phone: string
          status: 'new' | 'answered' | 'rejected' | 'didnt_answer' | 'ended'
          call_started_at?: string
          call_ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          caller_uuid?: string | null
          receiver_uuid?: string | null
          caller_phone?: string
          receiver_phone?: string
          status?: 'new' | 'answered' | 'rejected' | 'didnt_answer' | 'ended'
          call_started_at?: string
          call_ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      credits: {
        Row: {
          user_id: string
          credits_balance: number
          wallet_address: string | null
          blockchain_balance: number
          last_blockchain_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          credits_balance?: number
          wallet_address?: string | null
          blockchain_balance?: number
          last_blockchain_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          credits_balance?: number
          wallet_address?: string | null
          blockchain_balance?: number
          last_blockchain_sync?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: 'credit_purchase' | 'promo_purchase' | 'refund'
          payment_method: 'credit-card' | 'crypto-wallet' | null
          amount_pesos: number | null
          credits_amount: number
          status: 'pending' | 'completed' | 'failed'
          blockchain_tx_hash: string | null
          blockchain_status: 'pending' | 'confirmed' | 'failed'
          blockchain_confirmed_at: string | null
          gas_fee_eth: number | null
          block_number: number | null
          transfer_note: string | null
          metadata: Record<string, unknown>
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type: 'credit_purchase' | 'promo_purchase' | 'refund'
          payment_method?: 'credit-card' | 'crypto-wallet' | null
          amount_pesos?: number | null
          credits_amount: number
          status?: 'pending' | 'completed' | 'failed'
          blockchain_tx_hash?: string | null
          blockchain_status?: 'pending' | 'confirmed' | 'failed'
          blockchain_confirmed_at?: string | null
          gas_fee_eth?: number | null
          block_number?: number | null
          transfer_note?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: 'credit_purchase' | 'promo_purchase' | 'refund'
          payment_method?: 'credit-card' | 'crypto-wallet' | null
          amount_pesos?: number | null
          credits_amount?: number
          status?: 'pending' | 'completed' | 'failed'
          blockchain_tx_hash?: string | null
          blockchain_status?: 'pending' | 'confirmed' | 'failed'
          blockchain_confirmed_at?: string | null
          gas_fee_eth?: number | null
          block_number?: number | null
          transfer_note?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
        }
      }
      user_promos: {
        Row: {
          id: string
          user_id: string
          promo_id: string
          promo_name: string
          promo_type: 'unlimited_both' | 'unlimited_text' | 'unlimited_calls' | 'limited_both' | 'limited_text' | 'limited_calls'
          text_allowance: number | null
          text_used: number
          call_allowance: number | null
          call_used: number
          credits_paid: number
          expires_at: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          promo_id: string
          promo_name: string
          promo_type: 'unlimited_both' | 'unlimited_text' | 'unlimited_calls' | 'limited_both' | 'limited_text' | 'limited_calls'
          text_allowance?: number | null
          text_used?: number
          call_allowance?: number | null
          call_used?: number
          credits_paid: number
          expires_at: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          promo_id?: string
          promo_name?: string
          promo_type?: 'unlimited_both' | 'unlimited_text' | 'unlimited_calls' | 'limited_both' | 'limited_text' | 'limited_calls'
          text_allowance?: number | null
          text_used?: number
          call_allowance?: number | null
          call_used?: number
          credits_paid?: number
          expires_at?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      investment_transactions: {
        Row: {
          id: string
          user_id: string
          transaction_type: string
          payment_method: string | null
          token_symbol: string
          token_name: string
          token_amount: number
          token_price_at_purchase: number
          amount_pesos: number | null
          credits_amount: number | null
          total_cost: number
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          wallet_address: string | null
          blockchain_tx_hash: string | null
          blockchain_status: 'pending' | 'confirmed' | 'failed'
          blockchain_confirmed_at: string | null
          block_number: number | null
          gas_fee_eth: number | null
          network: string | null
          transfer_note: string | null
          metadata: Record<string, unknown>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          transaction_type?: string
          payment_method?: string | null
          token_symbol: string
          token_name: string
          token_amount: number
          token_price_at_purchase: number
          amount_pesos?: number | null
          credits_amount?: number | null
          total_cost: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          wallet_address?: string | null
          blockchain_tx_hash?: string | null
          blockchain_status?: 'pending' | 'confirmed' | 'failed'
          blockchain_confirmed_at?: string | null
          block_number?: number | null
          gas_fee_eth?: number | null
          network?: string | null
          transfer_note?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          transaction_type?: string
          payment_method?: string | null
          token_symbol?: string
          token_name?: string
          token_amount?: number
          token_price_at_purchase?: number
          amount_pesos?: number | null
          credits_amount?: number | null
          total_cost?: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          wallet_address?: string | null
          blockchain_tx_hash?: string | null
          blockchain_status?: 'pending' | 'confirmed' | 'failed'
          blockchain_confirmed_at?: string | null
          block_number?: number | null
          gas_fee_eth?: number | null
          network?: string | null
          transfer_note?: string | null
          metadata?: Record<string, unknown>
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper types for easier use
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Call = Database['public']['Tables']['calls']['Row']
export type Credits = Database['public']['Tables']['credits']['Row']
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type UserPromo = Database['public']['Tables']['user_promos']['Row']
export type InvestmentTransaction = Database['public']['Tables']['investment_transactions']['Row']

export type ConversationInsert = Database['public']['Tables']['conversations']['Insert']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type CallInsert = Database['public']['Tables']['calls']['Insert']
export type CallUpdate = Database['public']['Tables']['calls']['Update']
export type CreditsInsert = Database['public']['Tables']['credits']['Insert']
export type CreditsUpdate = Database['public']['Tables']['credits']['Update']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']
export type UserPromoInsert = Database['public']['Tables']['user_promos']['Insert']
export type UserPromoUpdate = Database['public']['Tables']['user_promos']['Update']
export type InvestmentTransactionInsert = Database['public']['Tables']['investment_transactions']['Insert']
export type InvestmentTransactionUpdate = Database['public']['Tables']['investment_transactions']['Update']
