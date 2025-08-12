import React, { useState, useEffect } from 'react';
import { Edit3, Target, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { Category, financeQueries } from '../lib/supabase';
import { useBudgetContext } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';

interface CategoryRowProps {
  category: Category;
}

interface CategoryBudgetData {
  budgeted: number;
  spent: number;
  available: number;
  rollover: number;
}

export function CategoryRow({ category }: CategoryRowProps) {
  const { user } = useAuth();
  const { currentDate, selectedCategory, setSelectedCategory, refreshTrigger } = useBudgetContext();
  const [budgetData, setBudgetData] = useState<CategoryBudgetData>({
    budgeted: 0,
    spent: 0,
    available: 0,
    rollover: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
  const isSelected = selectedCategory?.id === category.id;

  const fetchCategoryData = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');

    try {
      const data = await financeQueries.getCategoryBudgetAndSpent(user.id, category.id, currentMonth);
      setBudgetData(data);
    } catch (err: any) {
      console.error('Error fetching category data:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryData();
  }, [user?.id, category.id, currentMonth, refreshTrigger]);

  const handleRowClick = () => {
    setSelectedCategory(category);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getProgressPercentage = () => {
    if (budgetData.budgeted <= 0) return 0;
    return Math.min((budgetData.spent / budgetData.budgeted) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (budgetData.available < 0) return 'bg-red-500';
    if (percentage >= 90) return 'bg-orange-500';
    if (percentage >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getAvailableColor = () => {
    if (budgetData.available < 0) return 'text-red-600';
    if (budgetData.available === 0) return 'text-gray-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50 animate-pulse">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-4 h-4 bg-gray-300 rounded-full" />
          <div className="h-4 bg-gray-300 rounded flex-1 max-w-32" />
        </div>
        <div className="flex items-center gap-4">
          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-center gap-3 flex-1">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: category.color }}
          />
          <span className="font-medium text-gray-900">{category.name}</span>
        </div>
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleRowClick}
      className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected
          ? 'border-green-500 bg-green-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/50'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 min-w-0">
        {/* Category Color & Name */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div
            className="w-4 h-4 rounded-full flex-shrink-0"
            style={{ backgroundColor: category.color }}
          />
          <div className="min-w-0 flex-1">
            <span className="font-medium text-gray-900 truncate block">
              {category.name}
            </span>
            {category.type !== 'spending' && (
              <span className="text-xs text-gray-500 capitalize">
                {category.type === 'income' ? 'Receita' : 'Poupança'}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar (Desktop) */}
        <div className="hidden md:flex items-center flex-1 max-w-24">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{
                width: `${getProgressPercentage()}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Budget Values */}
      <div className="flex items-center gap-6 text-sm">
        <div className="text-right min-w-20">
          <div className="text-gray-500 text-xs">Orçado</div>
          <div className="font-medium text-gray-900">
            {formatCurrency(budgetData.budgeted)}
          </div>
        </div>
        <div className="text-right min-w-20">
          <div className="text-gray-500 text-xs">Gasto</div>
          <div className="font-medium text-gray-900">
            {formatCurrency(budgetData.spent)}
          </div>
        </div>
        <div className="text-right min-w-20">
          <div className="text-gray-500 text-xs">Disponível</div>
          <div className={`font-medium ${getAvailableColor()}`}>
            {formatCurrency(budgetData.available)}
          </div>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1 ml-2">
          {budgetData.rollover > 0 && (
            <div className="w-2 h-2 bg-blue-500 rounded-full" title="Rollover ativo" />
          )}
          {isSelected && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Selecionado" />
          )}
        </div>
      </div>
    </div>
  );
}