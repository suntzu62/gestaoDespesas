import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { CategoryGroupWithCategories } from '../lib/supabase';
import { CategoryRow } from './CategoryRow';
import { CategoryModal } from './CategoryModal';
import { useBudgetContext } from '../contexts/BudgetContext';

interface CategoryGroupProps {
  group: CategoryGroupWithCategories;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
}

export function CategoryGroup({ 
  group, 
  isExpanded = true, 
  onToggleExpanded 
}: CategoryGroupProps) {
  const { refreshBudget } = useBudgetContext();
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  
  const handleAddCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCategoryModalOpen(true);
  };

  return (
    <div className="space-y-1">
      {/* Group Header */}
      <div 
        className="flex items-center justify-between p-2 cursor-pointer group/header"
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-2">
          {onToggleExpanded && (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </>
          )}
          
          <h3 className="font-semibold text-gray-900 text-sm">
            {group.name}
          </h3>
        </div>

        {/* Add Category Button */}
        <button
          onClick={handleAddCategory}
          className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors opacity-0 group-hover/header:opacity-100"
        >
          <Plus className="w-3 h-3" />
          Adicionar Categoria
        </button>
      </div>

      {/* Categories */}
      {isExpanded && (
        <div className="space-y-1 ml-6">
          {group.categories.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              <p className="text-sm">Nenhuma categoria neste grupo</p>
              <button 
                onClick={handleAddCategory}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
              >
                + Adicionar primeira categoria
              </button>
            </div>
          ) : (
            group.categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))
          )}
        </div>
      )}

      {/* Category Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        preselectedGroupId={group.id}
        onSuccess={() => {
          setIsCategoryModalOpen(false);
          refreshBudget();
        }}
      />
    </div>
  );
}