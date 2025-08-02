import React, { useState, useEffect } from 'react';
import { X, Plus, Upload, Loader2, DollarSign, Calendar, FileText, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase, Account, Category } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const transactionSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória'),
  amount: z.string().min(1, 'Valor é obrigatório'),
  date: z.string().min(1, 'Data é obrigatória'),
  account_id: z.string().min(1, 'Conta é obrigatória'),
  category_id: z.string().optional(),
  type: z.enum(['income', 'expense', 'transfer']),
  notes: z.string().optional(),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'manual' | 'import'>('manual');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchType = watch('type');

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchAccountsAndCategories();
    }
  }, [isOpen, user?.id]);

  const fetchAccountsAndCategories = async () => {
    if (!user?.id) return;

    try {
      const [accountsResult, categoriesResult] = await Promise.all([
        supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('name'),
        supabase
          .from('categories')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_hidden', false)
          .order('sort_order'),
      ]);

      if (accountsResult.error) throw accountsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      setAccounts(accountsResult.data || []);
      setCategories(categoriesResult.data || []);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Erro ao carregar contas e categorias');
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      const amount = parseFloat(data.amount.replace(',', '.'));
      
      // For expenses, make amount negative
      // For income, keep positive
      // For transfers, handle separately (would need more complex logic)
      const finalAmount = data.type === 'expense' ? -Math.abs(amount) : Math.abs(amount);

      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          account_id: data.account_id,
          category_id: data.category_id || null,
          description: data.description,
          amount: finalAmount,
          type: data.type,
          date: data.date,
          notes: data.notes || null,
          is_cleared: true, // Auto-mark manual transactions as cleared
        });

      if (insertError) throw insertError;

      // Update account balance
      const { data: accountData } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', data.account_id)
        .single();

      if (accountData) {
        const newBalance = (accountData.balance || 0) + finalAmount;
        await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', data.account_id);
      }

      reset();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error creating transaction:', err);
      setError('Erro ao criar transação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    // Remove non-numeric characters except comma and dot
    const numericValue = value.replace(/[^\d,.-]/g, '');
    return numericValue;
  };

  const filteredCategories = categories.filter(category => {
    if (watchType === 'income') return category.type === 'income';
    if (watchType === 'expense') return category.type === 'spending';
    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Nova Transação</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('manual')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'manual'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Manual
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-3 px-4 text-center font-medium transition-colors ${
              activeTab === 'import'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Importar
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'manual' ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Transaction Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de transação
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('type', 'expense')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      watchType === 'expense'
                        ? 'bg-red-100 text-red-700 border-2 border-red-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    Despesa
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('type', 'income')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      watchType === 'income'
                        ? 'bg-green-100 text-green-700 border-2 border-green-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    Receita
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('type', 'transfer')}
                    className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                      watchType === 'transfer'
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                    }`}
                  >
                    Transferência
                  </button>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('description')}
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Ex: Almoço no restaurante"
                  />
                </div>
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('amount')}
                    type="text"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0,00"
                    onChange={(e) => {
                      const formatted = formatCurrency(e.target.value);
                      setValue('amount', formatted);
                    }}
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('date')}
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {errors.date && (
                  <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              {/* Account */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conta
                </label>
                <select
                  {...register('account_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Selecione uma conta</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
                {errors.account_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.account_id.message}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Categoria
                </label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    {...register('category_id')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione uma categoria (opcional)</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações (opcional)
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Informações adicionais..."
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Adicionar Transação
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importar Transações</h3>
              <p className="text-gray-500 mb-6">
                Importe transações via CSV, OFX ou conecte sua conta bancária
              </p>
              <div className="space-y-3">
                <button className="w-full border-2 border-dashed border-gray-300 rounded-lg py-4 px-6 text-gray-600 hover:border-green-400 hover:text-green-600 transition-colors">
                  <Upload className="w-5 h-5 inline mr-2" />
                  Selecionar arquivo CSV/OFX
                </button>
                <div className="text-sm text-gray-500">ou</div>
                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                  Conectar conta bancária
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}