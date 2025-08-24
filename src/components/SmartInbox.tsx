import React, { useState, useEffect } from 'react';
import { 
  Inbox, 
  Check, 
  Edit3, 
  X, 
  Loader2, 
  AlertCircle, 
  Calendar,
  DollarSign,
  Package,
  RefreshCw
} from 'lucide-react';
import { InboxItem, Account, Category, financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { InboxItemModal } from './InboxItemModal';

interface SmartInboxProps {
  onTransactionConfirmed?: () => void;
}

export function SmartInbox({ onTransactionConfirmed }: SmartInboxProps) {
  const { user } = useAuth();
  const [inboxItems, setInboxItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editingItem, setEditingItem] = useState<InboxItem | null>(null);
  
  const whatsappNumber = "5511999999999"; // Substitua pelo número real

  useEffect(() => {
    if (user?.id) {
      fetchInboxItems();
      fetchAccountsAndCategories();
    }
  }, [user?.id]);

  const fetchInboxItems = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const { data, error } = await financeQueries.getUserInboxItems(user.id, 'pending');
      
      if (error) throw error;
      setInboxItems(data || []);
    } catch (err: any) {
      console.error('Error fetching inbox items:', err);
      setError('Erro ao carregar itens da inbox');
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountsAndCategories = async () => {
    if (!user?.id) return;

    try {
      const [accountsResult, categoriesResult] = await Promise.all([
        financeQueries.getUserAccounts(user.id),
        financeQueries.getUserCategories(user.id),
      ]);

      if (accountsResult.error) throw accountsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setAccounts(accountsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (err: any) {
      console.error('Error fetching accounts and categories:', err);
    }
  };

  const handleConfirm = async (inboxItem: InboxItem) => {
    if (!user?.id || !accounts.length) return;

    setActionLoading(inboxItem.id);

    try {
      // Use the first account as default (you could add account selection UI)
      const defaultAccountId = accounts[0].id;
      
      await financeQueries.confirmInboxItem(
        user.id,
        inboxItem.id,
        defaultAccountId,
        inboxItem.suggested_category_id
      );

      // Remove from local state with optimistic update
      setInboxItems(prev => prev.filter(item => item.id !== inboxItem.id));
      
      // Callback to refresh dashboard
      onTransactionConfirmed?.();

      // Show success toast (you can implement a toast system)
      console.log('Transaction confirmed successfully');

    } catch (err: any) {
      console.error('Error confirming transaction:', err);
      setError('Erro ao confirmar transação');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (inboxItem: InboxItem) => {
    setActionLoading(inboxItem.id);

    try {
      await financeQueries.rejectInboxItem(inboxItem.id);
      
      // Remove from local state with optimistic update
      setInboxItems(prev => prev.filter(item => item.id !== inboxItem.id));

    } catch (err: any) {
      console.error('Error rejecting item:', err);
      setError('Erro ao descartar item');
    } finally {
      setActionLoading(null);
    }
  };

  const handleEdit = (inboxItem: InboxItem) => {
    setEditingItem(inboxItem);
  };

  const handleEditSuccess = (updatedItem: InboxItem) => {
    setInboxItems(prev => 
      prev.map(item => item.id === updatedItem.id ? updatedItem : item)
    );
    setEditingItem(null);
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

  const getCategoryIcon = (category?: any) => {
    // You can map category icons here or use a default
    return <Package className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Carregando inbox...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Inbox className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Smart Inbox</h2>
                <p className="text-sm text-gray-600">
                  {inboxItems.length} {inboxItems.length === 1 ? 'item pendente' : 'itens pendentes'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchInboxItems}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}

          {inboxItems.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Smart Inbox vazia
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                Envie comprovantes pelo WhatsApp e eles aparecerão aqui para 
                confirmação em 1 clique. Teste com alguns exemplos!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a 
                  href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Olá! Quero testar o BolsoZen. Como envio meu primeiro comprovante?")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Enviar pelo WhatsApp
                </a>
                <button 
                  onClick={() => {/* TODO: Implementar seed de exemplos */}}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Adicionar Exemplos
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {inboxItems.map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    {/* Item Info */}
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex-shrink-0">
                        {item.suggested_category ? 
                          getCategoryIcon(item.suggested_category) : 
                          <Package className="w-4 h-4 text-gray-400" />
                        }
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">
                          {item.description}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(item.date).toLocaleDateString('pt-BR')}
                          </div>
                          {item.suggested_category && (
                            <div className="flex items-center gap-1">
                              <span>•</span>
                              <span>{item.suggested_category.name}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <span>•</span>
                            <span className="capitalize">{item.source}</span>
                          </div>
                        </div>
                      </div>

                      <div className={`font-semibold ${getAmountColor(item.amount)}`}>
                        {getAmountSign(item.amount)}{formatCurrency(item.amount)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleEdit(item)}
                        disabled={actionLoading === item.id}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleReject(item)}
                        disabled={actionLoading === item.id}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Descartar"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                      </button>
                      
                      <button
                        onClick={() => handleConfirm(item)}
                        disabled={actionLoading === item.id}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === item.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Check className="w-4 h-4" />
                        )}
                        Confirmar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingItem && (
        <InboxItemModal
          isOpen={true}
          onClose={() => setEditingItem(null)}
          inboxItem={editingItem}
          categories={categories}
          onSuccess={handleEditSuccess}
        />
      )}
    </>
  );
}