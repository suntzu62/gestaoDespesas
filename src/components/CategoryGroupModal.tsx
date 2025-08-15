import React, { useState, useEffect } from 'react';
import { X, Folder, Trash2, Loader2, Hash } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCategoryGroupData, UpdateCategoryGroupData, createCategoryGroupSchema, updateCategoryGroupSchema } from '../lib/validations';
import { CategoryGroup, financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBudgetContext } from '../contexts/BudgetContext';

interface CategoryGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingGroup?: CategoryGroup | null;
  onSuccess?: () => void;
}

type GroupFormData = CreateCategoryGroupData | UpdateCategoryGroupData;

export function CategoryGroupModal({ 
  isOpen, 
  onClose, 
  existingGroup, 
  onSuccess 
}: CategoryGroupModalProps) {
  const { user } = useAuth();
  const { refreshBudget } = useBudgetContext();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const isEditing = !!existingGroup;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<GroupFormData>({
    resolver: zodResolver(isEditing ? updateCategoryGroupSchema : createCategoryGroupSchema),
    defaultValues: {
      name: '',
      sort_order: 0,
    },
  });

  const watchName = watch('name');

  useEffect(() => {
    if (isOpen) {
      if (existingGroup) {
        // Populate form with existing group data
        reset({
          name: existingGroup.name,
          sort_order: existingGroup.sort_order,
        });
      } else {
        // Reset form for new group
        reset({
          name: '',
          sort_order: 0,
        });
      }
      setError('');
    }
  }, [isOpen, existingGroup, reset]);

  const onSubmit = async (data: GroupFormData) => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      if (isEditing && existingGroup) {
        // Update existing group
        console.log('Updating existing group:', existingGroup.id);
        await financeQueries.updateCategoryGroup(existingGroup.id, data);
      } else {
        // Create new group
        const createData = data as CreateCategoryGroupData;
        console.log('Creating new group with data:', createData);
        await financeQueries.createCategoryGroup(user.id, createData.name, createData.sort_order);
      }

      console.log('Group operation successful');
      refreshBudget();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving category group:', err);
      setError(`Erro ao salvar grupo: ${err.message || 'Tente novamente.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingGroup || !user?.id) return;

    if (!confirm('Tem certeza de que deseja excluir este grupo de categorias? Todas as categorias do grupo ficarão sem grupo.')) {
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      await financeQueries.deleteCategoryGroup(existingGroup.id);
      refreshBudget();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error deleting category group:', err);
      setError('Erro ao excluir grupo de categorias. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Folder className="w-5 h-5 text-blue-600" />
            {isEditing ? 'Editar Grupo' : 'Novo Grupo'}
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Group Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome do Grupo
              </label>
              <input
                {...register('name')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Despesas Fixas"
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ordem de Classificação
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  {...register('sort_order', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  step="1"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0"
                />
              </div>
              {errors.sort_order && (
                <p className="mt-1 text-sm text-red-600">{errors.sort_order.message}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Menor número aparece primeiro na lista
              </p>
            </div>

            {/* Preview */}
            {watchName && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Preview:</h4>
                <div className="flex items-center gap-2 text-blue-800">
                  <Folder className="w-4 h-4" />
                  <span className="font-medium">{watchName}</span>
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
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {isEditing ? 'Atualizar Grupo' : 'Criar Grupo'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}