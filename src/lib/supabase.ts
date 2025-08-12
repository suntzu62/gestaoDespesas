import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

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

export interface CategoryGroup {
  id: string;
  user_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface CategoryWithGroup extends Category {
  group?: CategoryGroup;
}

export interface CategoryGroupWithCategories extends CategoryGroup {
  categories: CategoryWithGroup[];
}

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
  },

  // Calculate Age of Money (AOM)
  calculateAgeOfMoney: async (userId: string): Promise<number> => {
    try {
      // Get all transactions from last 6 months for calculation
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('date, amount, type')
        .eq('user_id', userId)
        .gte('date', sixMonthsAgo.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (error) throw error;
      if (!transactions || transactions.length === 0) return 0;

      // Simple AOM calculation: average time between income and expense
      let totalDays = 0;
      let expenseCount = 0;
      let lastIncomeDate: Date | null = null;

      for (const transaction of transactions) {
        const transactionDate = new Date(transaction.date);
        
        if (transaction.type === 'income' && transaction.amount > 0) {
          lastIncomeDate = transactionDate;
        } else if (transaction.type === 'expense' && lastIncomeDate) {
          const daysDifference = Math.abs(transactionDate.getTime() - lastIncomeDate.getTime()) / (1000 * 60 * 60 * 24);
          totalDays += daysDifference;
          expenseCount++;
        }
      }

      return expenseCount > 0 ? Math.round(totalDays / expenseCount) : 15; // Default to 15 days if no data
    } catch (error) {
      console.error('Error calculating Age of Money:', error);
      return 15; // Fallback value
    }
  },

  // Get spending by category for charts
  getSpendingByCategory: async (userId: string, month: string) => {
    const startDate = `${month}-01`;
    const endDate = `${month}-31`;
    
    const { data, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        category:categories(name, color)
      `)
      .eq('user_id', userId)
      .eq('type', 'expense')
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;

    // Group by category
    const categorySpending = data?.reduce((acc, transaction) => {
      const categoryName = transaction.category?.name || 'Sem categoria';
      const categoryColor = transaction.category?.color || '#6B7280';
      const amount = Math.abs(transaction.amount || 0);
      
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, value: 0, color: categoryColor };
      }
      acc[categoryName].value += amount;
      
      return acc;
    }, {} as Record<string, { name: string; value: number; color: string }>) || {};

    return Object.values(categorySpending);
  },

  // Get balance evolution for charts
  getBalanceEvolution: async (userId: string, monthsBack: number = 6) => {
    try {
      const months = [];
      const currentDate = new Date();
      
      // Generate last N months
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        months.push({
          month: date.toISOString().slice(0, 7),
          name: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        });
      }

      const balanceData = [];
      
      for (const { month, name } of months) {
        const startDate = `${month}-01`;
        const endDate = `${month}-31`;
        
        // Get total income and expenses for the month
        const { data: transactions, error } = await supabase
          .from('transactions')
          .select('amount, type')
          .eq('user_id', userId)
          .gte('date', startDate)
          .lte('date', endDate);

        if (error) throw error;

        const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0) || 0;
        const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount), 0) || 0;
        const netFlow = income - expenses;

        balanceData.push({
          month: name,
          receitas: income,
          despesas: expenses,
          saldo: netFlow
        });
      }

      return balanceData;
    } catch (error) {
      console.error('Error getting balance evolution:', error);
      return [];
    }
  },

  // Get budget vs actual spending comparison
  getBudgetVsActual: async (userId: string, month: string) => {
    try {
      // Get categories with their budgets
      const { data: budgets, error: budgetError } = await supabase
        .from('budgets')
        .select(`
          budgeted_amount,
          rollover_amount,
          category:categories(name, color)
        `)
        .eq('user_id', userId)
        .eq('month', `${month}-01`);

      if (budgetError) throw budgetError;

      // Get actual spending by category
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select(`
          amount,
          category:categories(name)
        `)
        .eq('user_id', userId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (transactionError) throw transactionError;

      // Group spending by category
      const spendingByCategory = transactions?.reduce((acc, transaction) => {
        const categoryName = transaction.category?.name || 'Sem categoria';
        const amount = Math.abs(transaction.amount || 0);
        acc[categoryName] = (acc[categoryName] || 0) + amount;
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine budget and actual data
      const comparison = budgets?.map(budget => ({
        category: budget.category?.name || 'Categoria',
        orçado: (budget.budgeted_amount || 0) + (budget.rollover_amount || 0),
        gasto: spendingByCategory[budget.category?.name || ''] || 0,
        color: budget.category?.color || '#6B7280'
      })) || [];

      return comparison.filter(item => item.orçado > 0 || item.gasto > 0);
    } catch (error) {
      console.error('Error getting budget vs actual:', error);
      return [];
    }
  },

  // ============ CATEGORY GROUPS FUNCTIONS ============

  // Get all category groups for a user
  getCategoryGroups: (userId: string) =>
    supabase
      .from('category_groups')
      .select('*')
      .eq('user_id', userId)
      .order('sort_order'),

  // Get categories by group
  getCategoriesByGroup: (userId: string, groupId?: string) => {
    let query = supabase
      .from('categories')
      .select(`
        *,
        group:category_groups(*)
      `)
      .eq('user_id', userId)
      .eq('is_hidden', false)
      .order('sort_order');

    if (groupId) {
      query = query.eq('group_id', groupId);
    } else {
      query = query.is('group_id', null);
    }

    return query;
  },

  // Get category groups with their categories
  getCategoryGroupsWithCategories: async (userId: string): Promise<CategoryGroupWithCategories[]> => {
    try {
      // Get all groups
      const { data: groups, error: groupsError } = await supabase
        .from('category_groups')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order');

      if (groupsError) throw groupsError;

      // Get all categories for this user
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select(`
          *,
          group:category_groups(*)
        `)
        .eq('user_id', userId)
        .eq('is_hidden', false)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      // Group categories by group_id
      const categoriesByGroup = categories?.reduce((acc, category) => {
        const groupId = category.group_id || 'ungrouped';
        if (!acc[groupId]) acc[groupId] = [];
        acc[groupId].push(category);
        return acc;
      }, {} as Record<string, CategoryWithGroup[]>) || {};

      // Combine groups with their categories
      const groupsWithCategories: CategoryGroupWithCategories[] = groups?.map(group => ({
        ...group,
        categories: categoriesByGroup[group.id] || []
      })) || [];

      // Add ungrouped categories as a special group if they exist
      if (categoriesByGroup['ungrouped']?.length > 0) {
        groupsWithCategories.push({
          id: 'ungrouped',
          user_id: userId,
          name: 'Sem Grupo',
          sort_order: 999,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          categories: categoriesByGroup['ungrouped']
        });
      }

      return groupsWithCategories;
    } catch (error) {
      console.error('Error getting category groups with categories:', error);
      return [];
    }
  },

  // Get budget and spent data for a specific category and month
  getCategoryBudgetAndSpent: async (userId: string, categoryId: string, month: string) => {
    try {
      // Get budget data
      const { data: budget, error: budgetError } = await supabase
        .from('budgets')
        .select('budgeted_amount, rollover_amount')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('month', `${month}-01`)
        .single();

      if (budgetError && budgetError.code !== 'PGRST116') throw budgetError;

      // Get spent amount
      const startDate = `${month}-01`;
      const endDate = `${month}-31`;
      
      const { data: transactions, error: transactionError } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('category_id', categoryId)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (transactionError) throw transactionError;

      const budgeted = (budget?.budgeted_amount || 0) + (budget?.rollover_amount || 0);
      const spent = transactions?.reduce((total, t) => total + Math.abs(t.amount || 0), 0) || 0;
      const available = budgeted - spent;

      return {
        budgeted,
        spent,
        available,
        rollover: budget?.rollover_amount || 0
      };
    } catch (error) {
      console.error('Error getting category budget and spent:', error);
      return { budgeted: 0, spent: 0, available: 0, rollover: 0 };
    }
  },

  // Get historical data for a category (for Inspector mini-chart)
  getCategoryHistoricalData: async (userId: string, categoryId: string, monthsBack: number = 6) => {
    try {
      const months = [];
      const currentDate = new Date();
      
      // Generate last N months
      for (let i = monthsBack - 1; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setMonth(date.getMonth() - i);
        months.push({
          month: date.toISOString().slice(0, 7),
          name: date.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
        });
      }

      const historicalData = [];

      for (const { month, name } of months) {
        const data = await financeQueries.getCategoryBudgetAndSpent(userId, categoryId, month);
        
        historicalData.push({
          month: name,
          planejado: data.budgeted,
          gasto: data.spent,
          disponivel: data.available
        });
      }

      return historicalData;
    } catch (error) {
      console.error('Error getting category historical data:', error);
      return [];
    }
  },

  // Get goals for a specific category
  getGoalsForCategory: (userId: string, categoryId: string) =>
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .eq('is_active', true)
      .order('created_at', { ascending: false }),

  // Create a new category group
  createCategoryGroup: async (userId: string, name: string, sortOrder?: number) => {
    const { data, error } = await supabase
      .from('category_groups')
      .insert({
        user_id: userId,
        name,
        sort_order: sortOrder || 0
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Update category group
  updateCategoryGroup: async (groupId: string, updates: Partial<CategoryGroup>) => {
    const { data, error } = await supabase
      .from('category_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete category group
  deleteCategoryGroup: async (groupId: string) => {
    const { error } = await supabase
      .from('category_groups')
      .delete()
      .eq('id', groupId);

    if (error) throw error;
  },

  // Update category to assign it to a group
  assignCategoryToGroup: async (categoryId: string, groupId: string | null) => {
    const { data, error } = await supabase
      .from('categories')
      .update({ group_id: groupId })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
};