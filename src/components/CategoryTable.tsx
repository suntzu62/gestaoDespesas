import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Edit3, 
  Trash2, 
  Loader2,
  TrendingUp,
  TrendingDown,
  AlertCircle
} from 'lucide-react';
import { supabase, Category, Budget } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface CategoryWithBudget extends Category {
  budgeted_amount_current: number;
  spent_amount: number;
  available_amount: number;
  progress_percentage: number;
}

interface CategoryTableProps {
  onAddTransaction: () => void;
}

export function CategoryTable({ onAddTransaction }: CategoryTableProps) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryWithBudget[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [error, setError] = useState<string>('');

  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
  const monthName = currentDate.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const fetchCategoriesWithBudget = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');

    try {
      // Get categories for the user
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_hidden', false)
        .order('sort_order');

      if (categoriesError) throw categoriesError;

      // Get budgets for current month
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budgets')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', `${currentMonth}-01`);

      if (budgetsError) throw budgetsError;

      // Get transactions for current month to calculate spent amounts
      const startDate = `${currentMonth}-01`;
      const endDate = `${currentMonth}-31`;
      
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('category_id, amount')
        .eq('user_id', user.id)
        .eq('type', 'expense')
        .gte('date', startDate)
        .lte('date', endDate);

      if (transactionsError) throw transactionsError;

      // Calculate spent amounts by category
      const spentByCategory = transactionsData?.reduce((acc, transaction) => {
        if (transaction.category_id) {
          acc[transaction.category_id] = (acc[transaction.category_id] || 0) + Math.abs(transaction.amount);
        }
        return acc;
      }, {} as Record<string, number>) || {};

      // Create budget lookup
      const budgetLookup = budgetsData?.reduce((acc, budget) => {
        acc[budget.category_id] = budget.budgeted_amount + (budget.rollover_amount || 0);
        return acc;
      }, {} as Record<string, number>) || {};

      // Combine data
      const categoriesWithBudget: CategoryWithBudget[] = categoriesData?.map(category => {
        const budgeted = budgetLookup[category.id] || category.budgeted_amount || 0;
        const spent = spentByCategory[category.id] || 0;
        const available = budgeted - spent;
        const progress = budgeted > 0 ? (spent / budgeted) * 100 : 0;

        return {
          ...category,
          budgeted_amount_current: budgeted,
          spent_amount: spent,
          available_amount: available,
          progress_percentage: Math.min(progress, 100),
        };
      }) || [];

      setCategories(categoriesWithBudget);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoriesWithBudget();
  }, [user?.id, currentMonth]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getProgressColor = (percentage: number, available: number) => {
    if (available < 0) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAvailableColor = (amount: number) => {
    if (amount < 0) return 'text-red-600';
    if (amount === 0) return 'text-gray-600';
    return 'text-green-600';
  };

  // Group categories by type
  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = [];
    }
    acc[category.type].push(category);
    return acc;
  }, {} as Record<string, CategoryWithBudget[]>);

  const categoryTypeLabels = {
    spending: 'Gastos',
    saving: 'Poupança',
    income: 'Receitas'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-2 text-gray-600">Carregando orçamento...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={fetchCategoriesWithBudget}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Orçamento por Categoria</h2>
          <div className="flex items-center gap-4">
            {/* Month Navigation */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-lg font-medium text-gray-700 min-w-48 text-center capitalize">
                {monthName}
              </span>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={onAddTransaction}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Transação</span>
              </button>
              <button className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Categoria</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="p-6">
        {Object.keys(groupedCategories).length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">Nenhuma categoria encontrada</div>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Criar primeira categoria
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedCategories).map(([type, typeCategories]) => (
              <div key={type} className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  {type === 'spending' && <TrendingDown className="w-5 h-5 text-red-500" />}
                  {type === 'saving' && <TrendingUp className="w-5 h-5 text-green-500" />}
                  {type === 'income' && <TrendingUp className="w-5 h-5 text-blue-500" />}
                  {categoryTypeLabels[type as keyof typeof categoryTypeLabels]}
                </h3>
                
                <div className="space-y-3">
                  {typeCategories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-4 flex-1">
                        {/* Category Color & Name */}
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <div
                            className="w-4 h-4 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="font-medium text-gray-900 truncate">
                            {category.name}
                          </span>
                        </div>

                        {/* Budget Progress */}
                        <div className="hidden md:flex items-center gap-4 flex-1">
                          <div className="flex-1 max-w-32">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(
                                  category.progress_percentage,
                                  category.available_amount
                                )}`}
                                style={{
                                  width: `${Math.min(category.progress_percentage, 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Budget Values */}
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <div className="text-gray-500">Planejado</div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(category.budgeted_amount_current)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-500">Gasto</div>
                          <div className="font-medium text-gray-900">
                            {formatCurrency(category.spent_amount)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-500">Disponível</div>
                          <div className={`font-medium ${getAvailableColor(category.available_amount)}`}>
                            {formatCurrency(category.available_amount)}
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}