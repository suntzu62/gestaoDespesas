import React, { useState, useEffect } from 'react';
import { X, Package, Trash2, Loader2, Hash, DollarSign, Palette, Tag } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CreateCategoryData, UpdateCategoryData, createCategorySchema, updateCategorySchema } from '../lib/validations';
import { Category, CategoryGroup, financeQueries } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useBudgetContext } from '../contexts/BudgetContext';
import { DEFAULT_CATEGORY_COLORS, POPULAR_CATEGORY_ICONS } from '../utils/defaultCategories';

// Icon components mapping
import { 
  Home, Car, ShoppingCart, Coffee, Phone, Heart, Music, Gamepad2, 
  Zap, Tv, Shield, GraduationCap, Dumbbell, Bus, Pill, Utensils, 
  Plane, Shirt, Smartphone, Play, Building, DollarSign as DollarIcon
} from 'lucide-react';

const iconComponents: Record<string, React.ComponentType<{ className?: string }>> = {
  'home': Home,
  'car': Car,
  'shopping-cart': ShoppingCart,
  'coffee': Coffee,
  'phone': Phone,
  'heart': Heart,
  'music': Music,
  'gamepad': Gamepad2,
  'package': Package,
  'zap': Zap,
  'tv': Tv,
  'shield': Shield,
  'graduation-cap': GraduationCap,
  'dumbbell': Dumbbell,
  'bus': Bus,
  'pill': Pill,
  'utensils': Utensils,
  'plane': Plane,
  'shirt': Shirt,
  'smartphone': Smartphone,
  'play': Play,
  'building': Building,
  'dollar-sign': DollarIcon,
};

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingCategory?: Category | null;
  preselectedGroupId?: string;
  onSuccess?: () => void;
}

type CategoryFormData = CreateCategoryData | UpdateCategoryData;

export function CategoryModal({ 
  isOpen, 
  onClose, 
  existingCategory, 
  preselectedGroupId,
  onSuccess 
}: CategoryModalProps) {
  const { user } = useAuth();
  const { refreshBudget } = useBudgetContext();
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroup[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const isEditing = !!existingCategory;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(isEditing ? updateCategorySchema : createCategorySchema),
    defaultValues: {
      name: '',
      type: 'spending',
      group_id: preselectedGroupId || '',
      budgeted_amount: 0,
      rollover_enabled: true,
      color: DEFAULT_CATEGORY_COLORS[0],
      icon: POPULAR_CATEGORY_ICONS[0],
      sort_order: 0,
    },
  });

  const watchColor = watch('color');
  const watchIcon = watch('icon');
  const watchType = watch('type');

  useEffect(() => {
    if (isOpen && user?.id) {
      fetchCategoryGroups();
    }
  }, [isOpen, user?.id]);

  useEffect(() => {
    if (isOpen) {
      if (existingCategory) {
        // Populate form with existing category data
        reset({
          name: existingCategory.name,
          type: existingCategory.type,
          group_id: existingCategory.group_id || '',
          budgeted_amount: existingCategory.budgeted_amount,
          rollover_enabled: existingCategory.rollover_enabled,
          color: existingCategory.color,
          icon: existingCategory.icon || 'package',
          sort_order: existingCategory.sort_order,
        });
      } else {
        // Reset form for new category
        reset({
          name: '',
          type: 'spending',
          group_id: preselectedGroupId || '',
          budgeted_amount: 0,
          rollover_enabled: true,
          color: DEFAULT_CATEGORY_COLORS[0],
          icon: POPULAR_CATEGORY_ICONS[0],
          sort_order: 0,
        });
      }
      setError('');
    }
  }, [isOpen, existingCategory, preselectedGroupId, reset]);

  const fetchCategoryGroups = async () => {
    if (!user?.id) return;
    
    setGroupsLoading(true);
    try {
      const { data, error } = await financeQueries.getCategoryGroups(user.id);
      if (error) throw error;
      setCategoryGroups(data || []);
    } catch (err: any) {
      console.error('Error fetching category groups:', err);
      setError('Erro ao carregar grupos de categorias');
    } finally {
      setGroupsLoading(false);
    }
  };

  const onSubmit = async (data: CategoryFormData) => {
    if (!user?.id) return;

    setLoading(true);
    setError('');

    try {
      if (isEditing && existingCategory) {
        // Update existing category
        await financeQueries.updateCategory(existingCategory.id, data);
      } else {
        // Create new category
        const createData = data as CreateCategoryData;
        await financeQueries.createCategory(user.id, {
          name: createData.name,
          type: createData.type,
          group_id: createData.group_id || undefined,
          budgeted_amount: createData.budgeted_amount,
          rollover_enabled: createData.rollover_enabled,
          color: createData.color,
          icon: createData.icon,
          sort_order: createData.sort_order,
        });
      }

      refreshBudget();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error saving category:', err);
      setError('Erro ao salvar categoria. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingCategory || !user?.id) return;

    if (!confirm('Tem certeza de que deseja excluir esta categoria? Todas as transações associadas ficarão sem categoria.')) {
      return;
    }

    setDeleteLoading(true);
    setError('');

    try {
      await financeQueries.deleteCategory(existingCategory.id);
      refreshBudget();
      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      setError('Erro ao excluir categoria. Tente novamente.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'spending': return 'Despesa';
      case 'saving': return 'Poupança';
      case 'income': return 'Receita';
      default: return 'Despesa';
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = iconComponents[iconName] || Package;
    return IconComponent;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="w-5 h-5 text-green-600" />
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
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
          {groupsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-green-600 animate-spin" />
              <span className="ml-2 text-gray-600">Carregando...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Category Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Categoria
                </label>
                <input
                  {...register('name')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Ex: Supermercado"
                  autoFocus
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Category Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Categoria
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['spending', 'saving', 'income'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setValue('type', type as any)}
                      className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                        watchType === type
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                      }`}
                    >
                      {getTypeLabel(type)}
                    </button>
                  ))}
                </div>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                )}
              </div>

              {/* Category Group */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grupo de Categoria (opcional)
                </label>
                <select
                  {...register('group_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">Sem grupo</option>
                  {categoryGroups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name}
                    </option>
                  ))}
                </select>
                {errors.group_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.group_id.message}</p>
                )}
              </div>

              {/* Budgeted Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor Orçado (R$)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    {...register('budgeted_amount', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="0,00"
                  />
                </div>
                {errors.budgeted_amount && (
                  <p className="mt-1 text-sm text-red-600">{errors.budgeted_amount.message}</p>
                )}
              </div>

              {/* Rollover Enabled */}
              <div className="flex items-center gap-3">
                <input
                  {...register('rollover_enabled')}
                  type="checkbox"
                  id="rollover_enabled"
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <label htmlFor="rollover_enabled" className="text-sm font-medium text-gray-700">
                  Permitir sobra para próximo mês (rollover)
                </label>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor da Categoria
                </label>
                <div className="grid grid-cols-8 gap-2 mb-2">
                  {DEFAULT_CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue('color', color)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        watchColor === color
                          ? 'border-gray-400 scale-110'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
                <input
                  {...register('color')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="#6B7280"
                />
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color.message}</p>
                )}
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ícone da Categoria
                </label>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {POPULAR_CATEGORY_ICONS.map((iconName) => {
                    const IconComponent = getIconComponent(iconName);
                    return (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() => setValue('icon', iconName)}
                        className={`p-2 rounded-lg border-2 transition-all ${
                          watchIcon === iconName
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                        title={iconName}
                      >
                        <IconComponent className="w-5 h-5 text-gray-600" />
                      </button>
                    );
                  })}
                </div>
                <input
                  {...register('icon')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  placeholder="package"
                />
                {errors.icon && (
                  <p className="mt-1 text-sm text-red-600">{errors.icon.message}</p>
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Preview:</h4>
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: watchColor }}
                  />
                  <div className="text-gray-600">
                    {(() => {
                      const IconComponent = getIconComponent(watchIcon || 'package');
                      return <IconComponent className="w-4 h-4" />;
                    })()}
                  </div>
                  <span className="font-medium text-gray-900">
                    {watch('name') || 'Nome da categoria'}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({getTypeLabel(watchType)})
                  </span>
                </div>
              </div>

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
                  {isEditing ? 'Atualizar Categoria' : 'Criar Categoria'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}