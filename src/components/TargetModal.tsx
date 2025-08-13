import React, { useState, useEffect } from 'react';
import { X, Target, Calendar, DollarSign, Repeat, Trash2, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateGoalData, UpdateGoalData, createGoalSchema, updateGoalSchema } from '../lib/validations';
import { Goal, financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBudgetContext } from '../contexts/BudgetContext';

interface TargetModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  categoryName: string;
  existingGoal?: Goal | null;
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
  } = useForm<GoalFormData>({
    resolver: zodResolver(isEditing ? updateGoalSchema : createGoalSchema),
    defaultValues: {
      type: 'saving_builder',
      target_amount: 0,
      monthly_contribution: 0,
    },
  });

  const watchType = watch('type');
  const watchTargetAmount = watch('target_amount');

  useEffect(() => {
    if (isOpen) {
      if (existingGoal) {
        // Populate form with existing goal data
        reset({
          name: existingGoal.name,
          description: existingGoal.description || '',
          target_amount: existingGoal.target_amount,
          target_date: existingGoal.target_date || '',
          type: existingGoal.type,
          monthly_contribution: existingGoal.monthly_contribution || 0,
          color: existingGoal.color,
        });
      } else {
        // Set default name for new goal
        reset({
          name: `Meta para ${categoryName}`,
          type: 'saving_builder',
          target_amount: 0,
          monthly_contribution: 0,
        });
      }
      setError('');
    }
  }, [isOpen, existingGoal, categoryName, reset]);

  const onSubmit = async (data: GoalFormData) => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      if (isEditing && existingGoal) {
        // Update existing goal
        await financeQueries.updateGoal(existingGoal.id, data);
      } else {
        // Create new goal
        const createData = data as CreateGoalData;
        await financeQueries.createGoal(user.id, {
          ...createData,
          category_id: categoryId,
        });
      }

      refreshBudget();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving goal:', err);
      setError('Erro ao salvar meta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGoal || !user?.id) return;

    if (!confirm('Tem certeza de que deseja excluir esta meta?')) {
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

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'saving_builder':
        return 'Economizar um valor específico';
      case 'target_by_date':
        return 'Economizar até uma data';
      case 'monthly_funding':
        return 'Contribuição mensal';
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
            {/* Goal Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Meta
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ex: Fundo de Emergência"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Meta
              </label>
              <select
                {...register('type')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="saving_builder">Economizar um valor específico</option>
                <option value="target_by_date">Economizar até uma data</option>
                <option value="monthly_funding">Contribuição mensal</option>
              </select>
              {errors.type && (
                <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
              )}
            </div>

            {/* Target Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Alvo (R$)
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

            {/* Target Date (for target_by_date type) */}
            {watchType === 'target_by_date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Data Alvo
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('target_date')}
                    type="date"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                {errors.target_date && (
                  <p className="mt-1 text-sm text-red-600">{errors.target_date.message}</p>
                )}
              </div>
            )}

            {/* Monthly Contribution (for monthly_funding type) */}
            {watchType === 'monthly_funding' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contribuição Mensal (R$)
                </label>
                <div className="relative">
                  <Repeat className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('monthly_contribution', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
                {errors.monthly_contribution && (
                  <p className="mt-1 text-sm text-red-600">{errors.monthly_contribution.message}</p>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descrição (opcional)
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Descreva o objetivo desta meta..."
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            {/* Preview */}
            {watchTargetAmount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Resumo da Meta:</h4>
                <div className="text-sm text-green-800 space-y-1">
                  <div>Tipo: {getGoalTypeLabel(watchType)}</div>
                  <div>Valor: {formatCurrency(watchTargetAmount)}</div>
                  {watchType === 'monthly_funding' && watch('monthly_contribution') > 0 && (
                    <div>
                      Tempo estimado: {Math.ceil(watchTargetAmount / (watch('monthly_contribution') || 1))} meses
                    </div>
                  )}
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
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