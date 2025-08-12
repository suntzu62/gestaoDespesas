import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Loader2, RefreshCw } from 'lucide-react';
import { financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BudgetSummaryData {
  totalBalance: number;
  totalBudgeted: number;
  totalSpent: number;
  availableAmount: number;
  moneyAge: number;
}

interface BudgetSummaryProps {
  currentDate: Date;
}

export function BudgetSummary({ currentDate }: BudgetSummaryProps) {
  const { user } = useAuth();
  const [data, setData] = useState<BudgetSummaryData>({
    totalBalance: 0,
    totalBudgeted: 0,
    totalSpent: 0,
    availableAmount: 0,
    moneyAge: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM

  const fetchSummaryData = async (isRefresh = false) => {
    if (!user?.id) return;
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      // Fetch all data in parallel
      const [totalBalance, totalBudgeted, totalSpent] = await Promise.all([
        financeQueries.getTotalBalance(user.id),
        financeQueries.getTotalBudgeted(user.id, currentMonth),
        financeQueries.getTotalSpent(user.id, currentMonth),
      ]);

      // Calculate Age of Money
      const moneyAge = await financeQueries.calculateAgeOfMoney(user.id);

      const availableAmount = totalBudgeted - totalSpent;

      setData({
        totalBalance,
        totalBudgeted,
        totalSpent,
        availableAmount,
        moneyAge,
      });
    } catch (err: any) {
      console.error('Error fetching summary data:', err);
      setError('Erro ao carregar dados financeiros');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummaryData();
  }, [user?.id, currentMonth]);

  const handleRefresh = () => {
    fetchSummaryData(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getAvailableAmountColor = (amount: number) => {
    if (amount > 0) return 'text-green-600';
    if (amount < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getAvailableAmountBg = (amount: number) => {
    if (amount > 0) return 'bg-green-50 border-green-200';
    if (amount < 0) return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-2 text-gray-600">Carregando resumo financeiro...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={handleRefresh}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Visão Geral</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Atualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {/* Total em Contas */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">TOTAL EM CONTAS</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {formatCurrency(data.totalBalance)}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            Saldo em todas as contas
          </div>
        </div>

        {/* Total Orçado */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <PieChart className="w-5 h-5 text-purple-600" />
            <span className="text-xs text-purple-600 font-medium">ORÇADO ESTE MÊS</span>
          </div>
          <div className="text-2xl font-bold text-purple-700">
            {formatCurrency(data.totalBudgeted)}
          </div>
          <div className="text-xs text-purple-600 mt-1">
            Planejado para {new Date().toLocaleDateString('pt-BR', { month: 'long' })}
          </div>
        </div>

        {/* Total Gasto */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            <span className="text-xs text-orange-600 font-medium">GASTO ESTE MÊS</span>
          </div>
          <div className="text-2xl font-bold text-orange-700">
            {formatCurrency(data.totalSpent)}
          </div>
          <div className="text-xs text-orange-600 mt-1">
            Despesas realizadas
          </div>
        </div>

        {/* Disponível */}
        <div className={`rounded-lg p-4 border ${getAvailableAmountBg(data.availableAmount)}`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className={`w-5 h-5 ${data.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-xs font-medium ${data.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              DISPONÍVEL
            </span>
          </div>
          <div className={`text-2xl font-bold ${getAvailableAmountColor(data.availableAmount)}`}>
            {formatCurrency(Math.abs(data.availableAmount))}
          </div>
          <div className={`text-xs mt-1 ${data.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {data.availableAmount >= 0 ? 'Dentro do orçamento' : 'Acima do orçado'}
          </div>
        </div>

        {/* Age of Money */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <span className="text-xs text-indigo-600 font-medium">IDADE DO DINHEIRO</span>
          </div>
          <div className="text-2xl font-bold text-indigo-700">
            {data.moneyAge} dias
          </div>
          <div className="text-xs text-indigo-600 mt-1">
            Tempo médio antes do gasto
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {data.totalBudgeted > 0 && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progresso do orçamento</span>
            <span>{Math.min(Math.round((data.totalSpent / data.totalBudgeted) * 100), 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                data.totalSpent <= data.totalBudgeted ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                width: `${Math.min((data.totalSpent / data.totalBudgeted) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}