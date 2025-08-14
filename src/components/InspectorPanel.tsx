import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Target, ChevronDown, Home, Zap, Tv, Shield, GraduationCap, Dumbbell, ShoppingCart, Car, Coffee, Phone, Heart, Music, Gamepad2, Package, DollarSign, Plus, Calendar, Loader2 } from 'lucide-react';
import { useBudgetContext } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { Goal, financeQueries } from '../lib/supabase';
import { TargetModal } from './TargetModal';

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
  };

  const IconComponent = iconMap[iconName?.toLowerCase() || ''] || Package;
  return IconComponent;
};

export function InspectorPanel() {
  const { user } = useAuth();
  const { selectedCategory } = useBudgetContext();
  const [categoryGoal, setCategoryGoal] = useState<Goal | null>(null);
  const [goalLoading, setGoalLoading] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);

  useEffect(() => {
    if (selectedCategory && user?.id) {
      fetchCategoryGoal();
    } else {
      setCategoryGoal(null);
    }
  }, [selectedCategory, user?.id]);

  const fetchCategoryGoal = async () => {
    if (!selectedCategory || !user?.id) return;
    
    setGoalLoading(true);
    try {
      const goal = await financeQueries.getGoalForCategory(user.id, selectedCategory.id);
      setCategoryGoal(goal);
    } catch (error) {
      console.error('Error fetching category goal:', error);
      setCategoryGoal(null);
    } finally {
      setGoalLoading(false);
    }
  };

  const handleTargetModalSuccess = () => {
    fetchCategoryGoal(); // Refresh goal data
    setIsTargetModalOpen(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'saving_builder':
        return 'Construtor de Poupança';
      case 'target_by_date':
        return 'Meta com Prazo';
      case 'monthly_funding':
        return 'Contribuição Mensal';
      default:
        return 'Meta';
    }
  };

  if (!selectedCategory) {
    return (
      <div className="h-full overflow-y-auto p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Nenhuma categoria selecionada
          </h3>
          <p className="text-gray-500 text-sm">
            Selecione uma categoria da lista para ver detalhes e gerenciar metas.
          </p>
        </div>
      </div>
    );
  }

  const IconComponent = getIconComponent(selectedCategory.icon);
  
  const handleEdit = () => {
    // TODO: Implementar modal de edição de categoria
    console.log('Editar categoria:', selectedCategory.name);
  };

  const handleDelete = () => {
    // TODO: Implementar confirmação de exclusão de categoria
    console.log('Excluir categoria:', selectedCategory.name);
  };

  return (
    <>
      <div className="h-full overflow-y-auto p-6">
        {/* Category Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 text-gray-700">
              <IconComponent className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedCategory.name}
            </h3>
          </div>
        
          <div className="flex items-center gap-2">
            <button
              onClick={handleEdit}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Editar categoria"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Excluir categoria"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Goal Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Meta</h4>
            <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {goalLoading ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando meta...</p>
            </div>
          ) : categoryGoal ? (
            // Display existing goal
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-green-900 mb-1">{categoryGoal.name}</h5>
                  <p className="text-sm text-green-700">{getGoalTypeLabel(categoryGoal.type)}</p>
                </div>
                <button
                  onClick={() => setIsTargetModalOpen(true)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Editar
                </button>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-700">Meta:</span>
                  <span className="font-medium text-green-900">
                    {formatCurrency(categoryGoal.target_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Atual:</span>
                  <span className="font-medium text-green-900">
                    {formatCurrency(categoryGoal.current_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Restante:</span>
                  <span className="font-medium text-green-900">
                    {formatCurrency(Math.max(0, categoryGoal.target_amount - categoryGoal.current_amount))}
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mt-3">
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((categoryGoal.current_amount / categoryGoal.target_amount) * 100, 100)}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-green-600 mt-1">
                  <span>0%</span>
                  <span>
                    {Math.round((categoryGoal.current_amount / categoryGoal.target_amount) * 100)}%
                  </span>
                  <span>100%</span>
                </div>
              </div>

              {categoryGoal.description && (
                <p className="text-sm text-green-700 mt-3 italic">
                  {categoryGoal.description}
                </p>
              )}
              
              {categoryGoal.target_date && (
                <div className="flex items-center gap-2 text-sm text-green-700 mt-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Prazo: {new Date(categoryGoal.target_date).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </div>
          ) : (
            // No goal - show creation prompt
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="mb-4">
                <h5 className="font-medium text-gray-900 mb-2">
                  Quanto você precisa para {selectedCategory.name}?
                </h5>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Quando você criar uma meta, saberá exatamente quanto separar para ficar no caminho certo ao longo do tempo.
                </p>
              </div>

              <button
                onClick={() => setIsTargetModalOpen(true)}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Meta
              </button>
            </div>
          )}
        </div>

        {/* Additional sections can be added here later */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="text-center text-gray-500 text-sm">
            Mais recursos em breve...
          </div>
        </div>
      </div>

      {/* Target Modal */}
      <TargetModal
        isOpen={isTargetModalOpen}
        onClose={() => setIsTargetModalOpen(false)}
        categoryId={selectedCategory.id}
        categoryName={selectedCategory.name}
        existingGoal={categoryGoal}
        onSuccess={handleTargetModalSuccess}
      />
    </>
  );
}