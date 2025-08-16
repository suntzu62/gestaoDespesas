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
export type GoalType = 'save_by_date' | 'save_monthly' | 'spend_monthly';

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
  group_id?: string;
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

// Updated Goal interface for new MVP approach
export interface Goal {
  id: string;
  user_id: string;
  category_id: string;
  type: GoalType;
  target_amount: number;
  due_date?: string;
  cadence?: 'monthly' | 'weekly' | null;
  note?: string;
  created_at: string;
}

// New interface for goal contributions
export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  date: string;
  created_at: string;
}

// Interface for goal with calculated progress (from view)
export interface GoalWithProgress extends Goal {
  contributed: number;
  progress_percentage: number;
  remaining_amount: number;
  estimated_completion_date?: string;
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
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // ============ CRUD OPERATIONS FOR CATEGORIES AND GROUPS ============

  // Create a new category
  createCategory: async (userId: string, categoryData: {
    name: string;
    type: CategoryType;
    group_id?: string;
    parent_category_id?: string;
    budgeted_amount?: number;
    rollover_enabled?: boolean;
    color?: string;
    icon?: string;
    sort_order?: number;
  }) => {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: userId,
        name: categoryData.name,
        type: categoryData.type,
        group_id: categoryData.group_id || null,
        parent_category_id: categoryData.parent_category_id || null,
        budgeted_amount: categoryData.budgeted_amount || 0,
        rollover_enabled: categoryData.rollover_enabled ?? true,
        color: categoryData.color || '#6B7280',
        icon: categoryData.icon || 'package',
        is_hidden: false,
        sort_order: categoryData.sort_order || 0,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Update category
  updateCategory: async (categoryId: string, updates: Partial<Category>) => {
    const { data, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Delete category
  deleteCategory: async (categoryId: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;
  },

  // Check if user has any category groups (used for initialization)
  hasExistingData: async (userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('category_groups')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (error) throw error;
    return data ? data.length > 0 : false;
  },

  // ============ GOALS/TARGETS FUNCTIONS - NEW MVP APPROACH ============

  // Get goals with progress using the view
  getGoalsWithProgress: async (userId: string, categoryId?: string): Promise<GoalWithProgress[]> => {
    try {
      let query = supabase
        .from('v_goal_progress')
        .select('*')
        .eq('user_id', userId);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;

      // Calculate derived fields for each goal
      return (data || []).map(item => {
        const contributed = item.contributed || 0;
        const progress = item.target_amount > 0 ? (contributed / item.target_amount) * 100 : 0;
        const remaining = Math.max(0, item.target_amount - contributed);
        
        // Calculate estimated completion date for save_by_date and save_monthly
        let estimatedCompletion = undefined;
        if (item.type === 'save_by_date' && item.due_date && remaining > 0) {
          const dueDate = new Date(item.due_date);
          const today = new Date();
          const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
          estimatedCompletion = `R$ ${(remaining / monthsRemaining).toFixed(2)}/mês`;
        } else if (item.type === 'save_monthly' && item.cadence === 'monthly' && remaining > 0) {
          // For monthly savings, just show target per month
          estimatedCompletion = `R$ ${item.target_amount.toFixed(2)}/mês`;
        }

        return {
          ...item,
          id: item.goal_id,
          contributed,
          progress_percentage: Math.min(progress, 100),
          remaining_amount: remaining,
          estimated_completion_date: estimatedCompletion,
        };
      });
    } catch (error) {
      console.error('Error getting goals with progress:', error);
      return [];
    }
  },

  // Create a new goal
  createGoal: async (userId: string, goalData: {
    category_id: string;
    type: GoalType;
    target_amount: number;
    due_date?: string;
    cadence?: 'monthly' | 'weekly' | null;
    note?: string;
  }) => {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        category_id: goalData.category_id,
        type: goalData.type,
        target_amount: goalData.target_amount,
        due_date: goalData.due_date || null,
        cadence: goalData.cadence || null,
        note: goalData.note || null,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Update an existing goal
  updateGoal: async (goalId: string, updates: Partial<Goal>) => {
    const { data, error } = await supabase
      .from('goals')
      .update({
        type: updates.type,
        target_amount: updates.target_amount,
        due_date: updates.due_date || null,
        cadence: updates.cadence || null,
        note: updates.note || null,
      })
      .eq('id', goalId)
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Delete a goal (set as inactive)
  deleteGoal: async (goalId: string) => {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId);

    if (error) throw error;
  },

  // Create a goal contribution
  createGoalContribution: async (userId: string, goalId: string, amount: number, date: string, note?: string) => {
    const { data, error } = await supabase
      .from('goal_contributions')
      .insert({
        user_id: userId,
        goal_id: goalId,
        amount: amount,
        date: date,
      })
      .select()
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  // Get contributions for a goal
  getGoalContributions: async (goalId: string) => {
    const { data, error } = await supabase
      .from('goal_contributions')
      .select('*')
      .eq('goal_id', goalId)
      .order('date', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  // Delete a goal contribution
  deleteGoalContribution: async (contributionId: string) => {
    const { error } = await supabase
      .from('goal_contributions')
      .delete()
      .eq('id', contributionId);

    if (error) throw error;
  },
};