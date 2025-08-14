import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Folder,
  Undo,
  Redo
} from 'lucide-react';
import { CategoryGroupWithCategories, financeQueries } from '../lib/supabase';
import { useBudgetContext } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';
import { CategoryGroup } from './CategoryGroup';

export function BudgetingModule() {
  const { user } = useAuth();
  const { currentDate, refreshTrigger } = useBudgetContext();
  const [categoryGroups, setCategoryGroups] = useState<CategoryGroupWithCategories[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const currentMonth = currentDate.toISOString().slice(0, 7); // YYYY-MM
  const monthName = currentDate.toLocaleDateString('pt-BR', { 
    month: 'short', 
    year: 'numeric' 
  });

  const fetchCategoryGroups = async (isRefresh = false) => {
    if (!user?.id) return;
    
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    try {
      const groups = await financeQueries.getCategoryGroupsWithCategories(user.id);
      setCategoryGroups(groups);
      
      // Auto-expand all groups on first load
      if (!isRefresh) {
        const expanded: Record<string, boolean> = {};
        groups.forEach(group => {
          expanded[group.id] = true;
        });
        setExpandedGroups(expanded);
      }
    } catch (err: any) {
      console.error('Error fetching category groups:', err);
      setError('Erro ao carregar grupos de categorias');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategoryGroups();
  }, [user?.id, refreshTrigger]);

  const handleRefresh = () => {
    fetchCategoryGroups(true);
  };

  const handleToggleGroup = (groupId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleToggleAllGroups = () => {
    const allExpanded = Object.values(expandedGroups).every(expanded => expanded);
    const newState: Record<string, boolean> = {};
    
    categoryGroups.forEach(group => {
      newState[group.id] = !allExpanded;
    });
    
    setExpandedGroups(newState);
  };

  const handleAddGroup = () => {
    // TODO: Implement add group modal
    console.log('Add new group');
  };

  const handleUndo = () => {
    // TODO: Implement undo functionality
    console.log('Undo last action');
  };

  const handleRedo = () => {
    // TODO: Implement redo functionality
    console.log('Redo last action');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <span className="ml-2 text-gray-600">Carregando orçamento...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => fetchCategoryGroups()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 capitalize">
            {monthName}
          </h2>
              
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Atualizar"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddGroup}
            className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            <Folder className="w-4 h-4" />
            Grupo de Categorias
          </button>
          
          <button
            onClick={handleUndo}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Desfazer"
          >
            <Undo className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Desfazer</span>
          </button>
          
          <button
            onClick={handleRedo}
            className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-2 py-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Refazer"
          >
            <Redo className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Refazer</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {categoryGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Folder className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum grupo de categorias encontrado
            </h4>
            <p className="text-gray-500 mb-6">
              Crie seu primeiro grupo de categorias para começar o orçamento
            </p>
            <button
              onClick={handleAddGroup}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
            >
              <Folder className="w-4 h-4" />
              Criar primeiro grupo
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {categoryGroups.map((group) => (
              <CategoryGroup
                key={group.id}
                group={group}
                isExpanded={expandedGroups[group.id] ?? true}
                onToggleExpanded={() => handleToggleGroup(group.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}