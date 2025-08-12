import React, { useState, useEffect } from 'react';
import { 
  Loader2, 
  AlertCircle, 
  Plus, 
  RefreshCw, 
  FolderPlus,
  Layers,
  ChevronDown,
  ChevronUp
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
    month: 'long', 
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

  const handleAddCategory = () => {
    // TODO: Implement add category modal
    console.log('Add new category');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
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
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-green-600" />
              Orçamento Base Zero
            </h3>
            <p className="text-gray-600 text-sm mt-1 capitalize">
              {monthName}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Expand/Collapse All */}
            <button
              onClick={handleToggleAllGroups}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              title={Object.values(expandedGroups).every(expanded => expanded) ? "Recolher todos" : "Expandir todos"}
            >
              {Object.values(expandedGroups).every(expanded => expanded) ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
              <span className="text-sm hidden sm:inline">
                {Object.values(expandedGroups).every(expanded => expanded) ? "Recolher" : "Expandir"}
              </span>
            </button>

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm hidden sm:inline">Atualizar</span>
            </button>

            {/* Add Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleAddGroup}
                className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-200 transition-colors"
                title="Novo grupo"
              >
                <FolderPlus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Grupo</span>
              </button>
              <button
                onClick={handleAddCategory}
                className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 transition-colors"
                title="Nova categoria"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm hidden sm:inline">Categoria</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {categoryGroups.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-gray-400" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum grupo de categorias encontrado
            </h4>
            <p className="text-gray-500 mb-6">
              Crie seus primeiros grupos e categorias para começar a usar o orçamento base zero
            </p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleAddGroup}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4" />
                Criar primeiro grupo
              </button>
              <button
                onClick={handleAddCategory}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar primeira categoria
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {categoryGroups.map((group) => (
              <CategoryGroup
                key={group.id}
                group={group}
                isExpanded={expandedGroups[group.id] ?? true}
                onToggleExpanded={() => handleToggleGroup(group.id)}
              />
            ))}
            
            {/* Summary Footer */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600">
                    {categoryGroups.length}
                  </div>
                  <div className="text-sm text-blue-600">
                    {categoryGroups.length === 1 ? 'Grupo' : 'Grupos'}
                  </div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600">
                    {categoryGroups.reduce((total, group) => total + group.categories.length, 0)}
                  </div>
                  <div className="text-sm text-purple-600">Categorias</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600">100%</div>
                  <div className="text-sm text-green-600">Orçamento alocado</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}