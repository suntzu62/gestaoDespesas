import React, { useState, useEffect } from 'react';
import { Edit3, Trash2, Target, Plus, Home, Zap, Tv, Shield, GraduationCap, Dumbbell, ShoppingCart, Car, Coffee, Phone, Heart, Music, Gamepad2, Package, DollarSign, Calendar, Loader2, TrendingUp, CheckCircle } from 'lucide-react';
import { useBudgetContext } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { GoalWithProgress, financeQueries } from '../lib/supabase';
import { TargetModal } from './TargetModal';
import { CategoryModal } from './CategoryModal';
import { ContributionModal } from './ContributionModal';

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
  const { selectedCategory, setSelectedCategory, refreshBudget } = useBudgetContext();
  const [categoryGoal, setCategoryGoal] = useState<GoalWithProgress | null>(null);
  const [goalLoading, setGoalLoading] = useState(false);
  const [isTargetModalOpen, setIsTargetModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isContributionModalOpen, setIsContributionModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      const goals = await financeQueries.getGoalsWithProgress(user.id, selectedCategory.id);
      setCategoryGoal(goals.length > 0 ? goals[0] : null);
    } catch (error) {
      console.error('Error fetching category goal:', error);
      setCategoryGoal(null);
    } finally {
      setGoalLoading(false);
    }
  };

  const handleTargetModalSuccess = () => {
    fetchCategoryGoal();
    refreshBudget();
    setIsTargetModalOpen(false);
  };

  const handleContributionSuccess = () => {
    fetchCategoryGoal();
    refreshBudget();
    setIsContributionModalOpen(false);
  };

  const handleCategoryModalSuccess = () => {
    setIsCategoryModalOpen(false);
    refreshBudget();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getGoalTypeLabel = (type: string) => {
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

  const handleEdit = () => {
    setIsCategoryModalOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedCategory || !user?.id) return;

    if (!confirm(`Tem certeza de que deseja excluir a categoria "${selectedCategory.name}"? Todas as transações associadas ficarão sem categoria.`)) {
      return;
    }

    setDeleteLoading(true);

    try {
      await financeQueries.deleteCategory(selectedCategory.id);
      refreshBudget();
      setSelectedCategory(null);
    } catch (err: any) {
      console.error('Error deleting category:', err);
    } finally {
      setDeleteLoading(false);
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
              disabled={deleteLoading}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Excluir categoria"
            >
              {deleteLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Goal Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Meta</h4>
          </div>

          {goalLoading ? (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <Loader2 className="w-6 h-6 text-gray-400 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Carregando meta...</p>
            </div>
          ) : categoryGoal ? (
            // Display existing goal with progress
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h5 className="font-medium text-green-900 mb-1">
                    Meta para {selectedCategory.name}
                  </h5>
                  <p className="text-sm text-green-700">{getGoalTypeLabel(categoryGoal.type)}</p>
                </div>
                <button
                  onClick={() => setIsTargetModalOpen(true)}
                  className="text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Editar
                </button>
              </div>
              
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span className="text-green-700">Meta:</span>
                  <span className="font-medium text-green-900">
                    {formatCurrency(categoryGoal.target_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Contribuído:</span>
                  <span className="font-medium text-green-900">
                    {formatCurrency(categoryGoal.contributed)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Restante:</span>
                  <span className="font-medium text-green-900">
                    {formatCurrency(categoryGoal.remaining_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Progresso:</span>
                  <span className="font-medium text-green-900">
                    {categoryGoal.progress_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-green-200 rounded-full h-3">
                  <div
                    className="bg-green-600 h-3 rounded-full transition-all duration-300 flex items-center justify-end pr-2"
                    style={{
                      width: `${Math.min(categoryGoal.progress_percentage, 100)}%`,
                    }}
                  >
                    {categoryGoal.progress_percentage >= 20 && (
                      <span className="text-white text-xs font-medium">
                        {categoryGoal.progress_percentage >= 100 ? '🎉' : `${categoryGoal.progress_percentage.toFixed(0)}%`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Estimation */}
              {categoryGoal.estimated_completion_date && (
                <div className="flex items-center gap-2 text-sm text-green-700 mb-4">
                  <Calendar className="w-4 h-4" />
                  <span>{categoryGoal.estimated_completion_date}</span>
                </div>
              )}

              {/* Achievement Status */}
              {categoryGoal.progress_percentage >= 100 && (
                <div className="bg-green-600 text-white rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Meta atingida! Parabéns! 🎉</span>
                  </div>
                </div>
              )}

              {/* Due Date Warning */}
              {categoryGoal.type === 'save_by_date' && categoryGoal.due_date && (
                (() => {
                  const dueDate = new Date(categoryGoal.due_date);
                  const today = new Date();
                  const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  
                  if (daysRemaining <= 30 && categoryGoal.progress_percentage < 100) {
                    return (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2 text-orange-700">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {daysRemaining > 0 
                              ? `Faltam apenas ${daysRemaining} dias!` 
                              : 'Meta vencida!'
                            }
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()
              )}

              {categoryGoal.note && (
                <p className="text-sm text-green-700 mb-4 italic bg-green-100 rounded p-2">
                  {categoryGoal.note}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => setIsContributionModalOpen(true)}
                  className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Contribuir
                </button>
                <button
                  onClick={() => setIsTargetModalOpen(true)}
                  className="flex-1 border border-green-600 text-green-600 py-2 px-3 rounded-lg font-medium hover:bg-green-50 transition-colors"
                >
                  Editar
                </button>
              </div>
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
                className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
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
            Histórico de contribuições em breve...
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

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        existingCategory={selectedCategory}
        onSuccess={handleCategoryModalSuccess}
      />

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={isContributionModalOpen}
        onClose={() => setIsContributionModalOpen(false)}
        goalId={categoryGoal?.id || ''}
        goalName={`Meta para ${selectedCategory.name}`}
        onSuccess={handleContributionSuccess}
      />
    </>
  );
}