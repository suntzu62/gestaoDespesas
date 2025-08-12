import React from 'react';
import { ChevronDown, ChevronRight, FolderOpen, Plus } from 'lucide-react';
import { CategoryGroupWithCategories } from '../lib/supabase';
import { CategoryRow } from './CategoryRow';

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
  
  const getCategoryTypeColor = (groupName: string) => {
    const lowerName = groupName.toLowerCase();
    if (lowerName.includes('receita') || lowerName.includes('renda')) {
      return 'text-green-600 bg-green-50';
    }
    if (lowerName.includes('poupança') || lowerName.includes('meta') || lowerName.includes('reserva')) {
      return 'text-blue-600 bg-blue-50';
    }
    return 'text-purple-600 bg-purple-50';
  };

  const getGroupIcon = (groupName: string) => {
    const lowerName = groupName.toLowerCase();
    if (lowerName.includes('receita') || lowerName.includes('renda')) {
      return '💰';
    }
    if (lowerName.includes('poupança') || lowerName.includes('meta') || lowerName.includes('reserva')) {
      return '🎯';
    }
    if (lowerName.includes('essencial') || lowerName.includes('básico')) {
      return '🏠';
    }
    if (lowerName.includes('lazer') || lowerName.includes('entretenimento')) {
      return '🎮';
    }
    if (lowerName.includes('transporte')) {
      return '🚗';
    }
    return '📁';
  };

  return (
    <div className="space-y-3">
      {/* Group Header */}
      <div 
        className={`flex items-center justify-between p-4 rounded-lg border ${
          isExpanded ? 'border-gray-300' : 'border-gray-200'
        } ${getCategoryTypeColor(group.name)} cursor-pointer transition-colors`}
        onClick={onToggleExpanded}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {onToggleExpanded && (
              <>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </>
            )}
            <span className="text-lg">{getGroupIcon(group.name)}</span>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-900">{group.name}</h3>
            <div className="text-sm opacity-75">
              {group.categories.length} {group.categories.length === 1 ? 'categoria' : 'categorias'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Group Summary (can be expanded later) */}
          <div className="text-right text-sm hidden md:block">
            <div className="opacity-75">Total do grupo</div>
            <div className="font-medium">R$ --</div>
          </div>
          
          <button
            className="p-1 opacity-60 hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              // TODO: Implement add category to group
              console.log('Add category to group:', group.name);
            }}
            title="Adicionar categoria"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Categories */}
      {isExpanded && (
        <div className="space-y-2 pl-4">
          {group.categories.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              <FolderOpen className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Nenhuma categoria neste grupo</p>
              <button className="text-green-600 hover:text-green-700 text-sm font-medium mt-2">
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
    </div>
  );
}