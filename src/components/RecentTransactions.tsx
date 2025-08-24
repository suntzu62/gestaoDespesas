import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Loader2, 
  Package, 
  Home,
  Zap,
  Tv,
  Shield,
  GraduationCap,
  Dumbbell,
  ShoppingCart,
  Car,
  Coffee,
  Phone,
  Heart,
  Music,
  Gamepad2,
  DollarSign,
  Building
} from 'lucide-react';
import { RecentTransaction, financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface RecentTransactionsProps {
  refreshTrigger?: number;
  onEdit?: (transactionId: string) => void;
}

const getIconComponent = (iconName?: string) => {
  const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    'home': Home,
    'house': Home,
    'mortgage': Home,
    'zap': Zap,
    'lightning': Zap,
    'utilities': Zap,
    'tv': Tv,
    'television': Tv,
    'internet': Tv,
    'shield': Shield,
    'insurance': Shield,
    'graduation-cap': GraduationCap,
    'student': GraduationCap,
    'dumbbell': Dumbbell,
    'fitness': Dumbbell,
    'shopping-cart': ShoppingCart,
    'groceries': ShoppingCart,
    'car': Car,
    'transport': Car,
    'coffee': Coffee,
    'food': Coffee,
    'phone': Phone,
    'mobile': Phone,
    'heart': Heart,
    'health': Heart,
    'music': Music,
    'entertainment': Music,
    'gamepad': Gamepad2,
    'games': Gamepad2,
    'package': Package,
    'shopping': Package,
    'dollar-sign': DollarSign,
    'money': DollarSign,
    'building': Building,
  };

  const IconComponent = iconMap[iconName?.toLowerCase() || ''] || Package;
  return IconComponent;
};

export function RecentTransactions({ refreshTrigger = 0, onEdit }: RecentTransactionsProps) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<RecentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');

  const fetchTransactions = async (isRefresh = false) => {
    if (!user?.id) return;
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const recentTransactions = await financeQueries.getRecentTransactions(user.id, 10);
      setTransactions(recentTransactions);
    } catch (err: any) {
      console.error('Error fetching recent transactions:', err);
      setError('Erro ao carregar transações recentes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [user?.id, refreshTrigger]);

  const handleRefresh = () => {
    fetchTransactions(true);
  };

  const handleDelete = async (transactionId: string) => {
    if (!user?.id) return;
    
    if (!confirm('Tem certeza de que deseja excluir esta transação?')) {
      return;
    }

    try {
      const { error } = await financeQueries.supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setTransactions(prev => prev.filter(t => t.id !== transactionId));
    } catch (err: any) {
      console.error('Error deleting transaction:', err);
      setError('Erro ao excluir transação');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(Math.abs(amount));
  };

  const getAmountColor = (amount: number) => {
    return amount > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getAmountSign = (amount: number) => {
    return amount > 0 ? '+' : '-';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <span className="ml-2 text-gray-600">Carregando transações...</span>
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
            className="text-purple-600 hover:text-purple-700 font-medium"
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
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Últimas Transações</h3>
            <p className="text-sm text-gray-600">{transactions.length} transações recentes</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm">Atualizar</span>
        </button>
      </div>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8 text-purple-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhuma transação ainda
            </h4>
            <p className="text-gray-500 mb-6">
              Suas transações confirmadas aparecerão aqui automaticamente.
            </p>
          </div>
        ) : (
          transactions.map((transaction) => {
            const IconComponent = getIconComponent(transaction.category?.icon);
            
            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
              >
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ 
                      backgroundColor: transaction.category?.color ? `${transaction.category.color}15` : '#f3f4f6',
                    }}
                  >
                    <IconComponent 
                      className="w-5 h-5"
                      style={{ color: transaction.category?.color || '#6b7280' }}
                    />
                  </div>
                </div>

                {/* Transaction Info */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 truncate">
                    {transaction.description}
                  </div>
                  <div className="text-sm text-gray-500 truncate">
                    {transaction.category?.name || 'Sem categoria'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                {/* Amount */}
                <div className={`font-semibold ${getAmountColor(transaction.amount)}`}>
                  {getAmountSign(transaction.amount)}{formatCurrency(transaction.amount)}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(transaction.id)}
                      className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                      title="Editar transação"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                    title="Excluir transação"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {transactions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button className="w-full text-center text-purple-600 hover:text-purple-700 font-medium text-sm transition-colors">
            Ver todas as transações →
          </button>
        </div>
      )}
    </div>
  );
}