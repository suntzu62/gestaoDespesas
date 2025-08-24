import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Inbox, RefreshCw, Loader2 } from 'lucide-react';
import { DashboardSummary, financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface DashboardCardsProps {
  currentDate: Date;
  refreshTrigger?: number;
}

export function DashboardCards({ currentDate, refreshTrigger = 0 }: DashboardCardsProps) {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary>({
    totalSpent: 0,
    totalIncome: 0,
    availableAmount: 0,
    pendingInboxItems: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM

  const fetchSummary = async (isRefresh = false) => {
    if (!user?.id) return;
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const summaryData = await financeQueries.getDashboardSummary(user.id, currentMonth);
      setSummary(summaryData);
    } catch (err: any) {
      console.error('Error fetching dashboard summary:', err);
      setError('Erro ao carregar resumo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, [user?.id, currentMonth, refreshTrigger]);

  const handleRefresh = () => {
    fetchSummary(true);
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
          <span className="ml-2 text-gray-600">Carregando resumo...</span>
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
        <h3 className="text-lg font-semibold text-gray-900">Resumo do Mês</h3>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Atualizar</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Income */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-xs text-green-600 font-medium">RECEITAS</span>
          </div>
          <div className="text-2xl font-bold text-green-700">
            {formatCurrency(summary.totalIncome)}
          </div>
          <div className="text-xs text-green-600 mt-1">
            Entradas no mês
          </div>
        </div>

        {/* Total Spent */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-xs text-red-600 font-medium">GASTOS</span>
          </div>
          <div className="text-2xl font-bold text-red-700">
            {formatCurrency(summary.totalSpent)}
          </div>
          <div className="text-xs text-red-600 mt-1">
            Despesas no mês
          </div>
        </div>

        {/* Available Amount */}
        <div className={`rounded-lg p-4 border ${getAvailableAmountBg(summary.availableAmount)}`}>
          <div className="flex items-center justify-between mb-2">
            <DollarSign className={`w-5 h-5 ${summary.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            <span className={`text-xs font-medium ${summary.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              SALDO
            </span>
          </div>
          <div className={`text-2xl font-bold ${getAvailableAmountColor(summary.availableAmount)}`}>
            {formatCurrency(Math.abs(summary.availableAmount))}
          </div>
          <div className={`text-xs mt-1 ${summary.availableAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.availableAmount >= 0 ? 'Sobrou no mês' : 'Déficit no mês'}
          </div>
        </div>

        {/* Pending Inbox Items */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <Inbox className="w-5 h-5 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium">INBOX</span>
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {summary.pendingInboxItems}
          </div>
          <div className="text-xs text-blue-600 mt-1">
            {summary.pendingInboxItems === 1 ? 'Item pendente' : 'Itens pendentes'}
          </div>
        </div>
      </div>

      {/* Progress indicator if there's activity */}
      {(summary.totalIncome > 0 || summary.totalSpent > 0) && (
        <div className="mt-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Atividade financeira</span>
            <span>
              {summary.totalIncome > 0 && summary.totalSpent > 0
                ? `${((summary.totalSpent / summary.totalIncome) * 100).toFixed(1)}% gastos`
                : 'Iniciando...'
              }
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                summary.totalIncome > summary.totalSpent ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{
                width: summary.totalIncome > 0 
                  ? `${Math.min((summary.totalSpent / summary.totalIncome) * 100, 100)}%`
                  : '0%',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}