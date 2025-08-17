import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign, Repeat, Trash2, Loader2, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateGoalData, UpdateGoalData, createGoalSchema, updateGoalSchema, GoalType } from '../lib/validations';
import { GoalWithProgress, financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBudgetContext } from '../contexts/BudgetContext';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  existingGoal?: GoalWithProgress | null;
  onSuccess?: () => void;
}

type GoalFormData = CreateGoalData | UpdateGoalData;

export function TargetModal({ 
  isOpen, 
  onClose, 
  categoryId, 
  categoryName, 
  existingGoal, 
  onSuccess 
}: TargetModalProps) {
  const { user } = useAuth();
  const { refreshBudget } = useBudgetContext();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const isEditing = !!existingGoal;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } 
    = useForm<GoalFormData>({
    resolver: zodResolver(isEditing ? updateGoalSchema : createGoalSchema),
    defaultValues: {
      type: 'save_by_date',
      target_amount: 0,
    },
  });
console.log('Form errors:', errors);

  const watchType = watch('type');
  const watchTargetAmount = watch('target_amount');
  const watchDueDate = watch('due_date');

  useEffect(() => {
    if (isOpen) {
      if (existingGoal) {
        // Populate form with existing goal data
        reset({
          type: existingGoal.type,
          target_amount: existingGoal.target_amount,
          due_date: existingGoal.due_date || '',
          cadence: existingGoal.cadence || undefined,
          note: existingGoal.note || '',
        });
      } else {
        // Set defaults for new goal
        reset({
          type: 'save_by_date',
          target_amount: 0,
          due_date: '',
          cadence: undefined,
          note: '',
        });
      }
      setError('');
    }
  }, [isOpen, existingGoal, reset]);

  const onSubmit = async (data: GoalFormData) => {
    if (!user?.id) return;

    console.log('Creating/updating goal with data:', data);
    setLoading(true);
    setError('');

    try {
      if (isEditing && existingGoal) {
        // Update existing goal
        console.log('Updating existing goal:', existingGoal.id);
        await financeQueries.updateGoal(existingGoal.id, data);
      } else {
        // Create new goal
        const createData = data as CreateGoalData;
        console.log('Creating new goal for category:', categoryId);
        await financeQueries.createGoal(user.id, {
          ...createData,
          category_id: categoryId,
        });
      }

      console.log('Goal operation successful');
      refreshBudget();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving goal:', err);
      setError(`Erro ao salvar meta: ${err.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGoal || !user?.id) return;

    if (!confirm('Tem certeza de que deseja excluir esta meta? Todas as contribuições serão perdidas.')) {
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      await financeQueries.deleteGoal(existingGoal.id);
      refreshBudget();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error deleting goal:', err);
      setError('Erro ao excluir meta. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const getGoalTypeLabel = (type: GoalType) => {
    switch (type) {
      case 'save_by_date':
        return 'Economizar até uma data';
      case 'save_monthly':
        return 'Economizar mensalmente';
      case 'spend_monthly':
        return 'Limite de gasto mensal';
      default:
        return 'Meta';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getHelpText = () => {
    if (!watchTargetAmount || watchTargetAmount <= 0) return null;

    switch (watchType) {
      case 'save_by_date':
        if (watchDueDate) {
          const dueDate = new Date(watchDueDate);
          const today = new Date();
          const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
          const monthlyAmount = watchTargetAmount / monthsRemaining;
          return `💡 Precisa reservar ${formatCurrency(monthlyAmount)}/mês até ${dueDate.toLocaleDateString('pt-BR')}`;
        }
        return null;
      case 'save_monthly':
        return `💡 Reservar ${formatCurrency(watchTargetAmount)} todo mês`;
      case 'spend_monthly':
        return `💡 Limite de gasto de ${formatCurrency(watchTargetAmount)}/mês`;
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            {isEditing ? 'Editar Meta' : 'Criar Meta'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-4">
            <div className="text-sm text-gray-600">Categoria:</div>
            <div className="font-medium text-gray-900">{categoryName}</div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Meta
              </label>
              <div className="space-y-2">
                {[
                  { value: 'save_by_date', label: 'Economizar até uma data' },
                  { value: 'save_monthly', label: 'Economizar mensalmente' },
                  { value: 'spend_monthly', label: 'Limite de gasto mensal' }
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-3 cursor-pointer">
                    <input
                      {...register('type')}
                      type="radio"
                      value={option.value}
                      className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {watchType === 'spend_monthly' ? 'Limite Mensal (R$)' : 'Valor Alvo (R$)'}
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  {...register('target_amount', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0,00"
                />
              </div>
              {errors.target_amount && (
                <p className="mt-1 text-sm text-red-600">{errors.target_amount.message}</p>
              )}
            </div>

            {/* Due Date (for save_by_date type) */}
            {watchType === 'save_by_date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Alvo
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('due_date')}
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {errors.due_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
                )}
              </div>
            )}

            {/* Cadence (for save_monthly and spend_monthly types) */}
            {(watchType === 'save_monthly' || watchType === 'spend_monthly') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequência
                </label>
                <div className="relative">
                  <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <select
                    {...register('cadence')}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="">Selecione a frequência</option>
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                  </select>
                </div>
                {errors.cadence && (
                  <p className="mt-1 text-sm text-red-600">{errors.cadence.message}</p>
                )}
              </div>
            )}

            {/* Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nota (opcional)
              </label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                <textarea
                  {...register('note')}
                  rows={3}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Descreva o objetivo desta meta..."
                />
              </div>
              {errors.note && (
                <p className="mt-1 text-sm text-red-600">{errors.note.message}</p>
              )}
            </div>

            {/* Help Text */}
            {getHelpText() && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800 text-sm">{getHelpText()}</p>
              </div>
            )}

            {/* Preview */}
            {watchTargetAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Resumo da Meta:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div>Tipo: {getGoalTypeLabel(watchType)}</div>
                  <div>Valor: {formatCurrency(watchTargetAmount)}</div>
                  {watchType === 'save_by_date' && watchDueDate && (
                    <div>
                      Prazo: {new Date(watchDueDate).toLocaleDateString('pt-BR')}
                    </div>
                  )}
                  {(watchType === 'save_monthly' || watchType === 'spend_monthly') && watch('cadence') && (
                    <div>
                      Frequência: {watch('cadence') === 'monthly' ? 'Mensal' : 'Semanal'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                <div className="flex items-start gap-2">
                  <div className="text-red-600 mt-0.5">⚠️</div>
                  <div>
                    <div className="font-medium">Erro ao salvar meta:</div>
                    <div className="text-sm mt-1">{error}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              {isEditing && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteLoading}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {deleteLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Excluir
                </button>
              )}
              
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Atualizar Meta' : 'Criar Meta'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}