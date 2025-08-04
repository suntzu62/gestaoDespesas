import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'defined' : 'undefined');
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'defined' : 'undefined');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

console.log('✅ Initializing Supabase client');
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for our database
export interface Profile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  economy_goal?: number;
  currency?: string;
  timezone?: string;
  role: UserRole;
}

export type UserRole = 'collaborator' | 'admin' | 'owner';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  role: UserRole;
}

// Finance system types
export type AccountType = 'checking' | 'savings' | 'credit_card' | 'investment' | 'cash';
export type CategoryType = 'spending' | 'saving' | 'income';
export type TransactionType = 'income' | 'expense' | 'transfer';
export type GoalType = 'saving_builder' | 'target_by_date' | 'monthly_funding';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  balance: number;
  bank_name?: string;
  account_number?: string;
  is_active: boolean;
  last_sync_at?: string;
  n8n_connection_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  type: CategoryType;
  parent_category_id?: string;
  budgeted_amount: number;
  rollover_enabled: boolean;
  color: string;
  icon?: string;
  is_hidden: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  is_cleared: boolean;
  is_recurring: boolean;
  recurring_interval?: string;
  n8n_import_id?: string;
  suggested_category_id?: string;
  notes?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  month: string; // YYYY-MM-01 format
  category_id: string;
  budgeted_amount: number;
  rollover_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category_id?: string;
  name: string;
  description?: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  type: GoalType;
  monthly_contribution: number;
  is_achieved: boolean;
  is_active: boolean;
  color: string;
  created_at: string;
  updated_at: string;
}

// Auth helper functions
export const authHelpers = {
  // Get current user profile
  getCurrentUserProfile: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profile) {
        return {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar_url: profile.avatar_url,
          role: profile.role as UserRole,
        } as AuthUser;
      }

      // Fallback to auth user data
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.full_name || user.email || '',
        avatar_url: user.user_metadata?.avatar_url,
        role: 'collaborator' as UserRole,
      } as AuthUser;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  },

  // Sign out helper
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
};

// Utility functions for finance operations
export const financeQueries = {
  // Get user's accounts
  getUserAccounts: (userId: string) => 
    supabase
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name'),

  // Get user's categories
  getUserCategories: (userId: string, type?: CategoryType) => {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('is_hidden', false)
      .order('sort_order');
    
    if (type) {
      query = query.eq('type', type);
    }
    
    return query;
  },

  // Get user's transactions for a specific month
  getUserTransactions: (userId: string, month?: string) => {
    let query = supabase
      .from('transactions')
      .select(`
        *,
        account:accounts(name, type),
        category:categories(name, color, icon)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (month) {
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      query = query.gte('date', startDate).lte('date', endDate);
    }

    return query;
  },

  // Get user's budget for a specific month
  getUserBudget: (userId: string, month: string) =>
    supabase
      .from('budgets')
      .select(`
        *,
        category:categories(name, type, color, icon)
      `)
      .eq('user_id', userId)
      .eq('month', `${month}-01`),

  // Get user's active goals
  getUserGoals: (userId: string) =>
    supabase
      .from('goals')
      .select(`
        *,
        category:categories(name, color, icon)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),

  // Calculate total account balances
  getTotalBalance: async (userId: string): Promise<number> => {
    const { data, error } = await supabase
      .from('accounts')
      .select('balance')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) throw error;
    
    return data?.reduce((total, account) => total + (account.balance || 0), 0) || 0;
  },

  // Calculate total spent in a month
  getTotalSpent: async (userId: string, month: string): Promise<number> => {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    
    const { data, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    
    return data?.reduce((total, transaction) => total + Math.abs(transaction.amount || 0), 0) || 0;
  },

  // Calculate total budgeted for a month
  getTotalBudgeted: async (userId: string, month: string): Promise<number> => {
    const { data, error } = await supabase
      .from('budgets')
      .select('budgeted_amount, rollover_amount')
      .eq('user_id', userId)
      .eq('month', `${month}-01`);

    if (error) throw error;
    
    return data?.reduce((total, budget) => 
      total + (budget.budgeted_amount || 0) + (budget.rollover_amount || 0), 0) || 0;
  }
};