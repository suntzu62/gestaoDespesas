import React from 'react';
import { Edit3, Trash2, Target, ChevronDown, Home, Zap, Tv, Shield, GraduationCap, Dumbbell, ShoppingCart, Car, Coffee, Phone, Heart, Music, Gamepad2, Package, DollarSign } from 'lucide-react';
import { useBudgetContext } from '../contexts/BudgetContext';

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
  const { selectedCategory } = useBudgetContext();

  if (!selectedCategory) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No category selected
          </h3>
          <p className="text-gray-500 text-sm">
            Select a category from the list to view details and manage targets.
          </p>
        </div>
      </div>
    );
  }

  const IconComponent = getIconComponent(selectedCategory.icon);
  
  const handleEdit = () => {
    // TODO: Implement edit category modal
    console.log('Edit category:', selectedCategory.name);
  };

  const handleDelete = () => {
    // TODO: Implement delete category confirmation
    console.log('Delete category:', selectedCategory.name);
  };

  const handleCreateTarget = () => {
    // TODO: Implement create target modal
    console.log('Create target for category:', selectedCategory.name);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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
            title="Edit category"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete category"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Target Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-900">Target</h4>
          <button className="flex items-center gap-1 text-gray-500 hover:text-gray-700">
            <ChevronDown className="w-4 h-4" />
          </button>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <div className="mb-4">
            <h5 className="font-medium text-gray-900 mb-2">
              How much do you need for {selectedCategory.name}?
            </h5>
            <p className="text-gray-600 text-sm leading-relaxed">
              When you create a target, we'll let you know how much money to set aside to stay on track over time.
            </p>
          </div>

          <button
            onClick={handleCreateTarget}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Create Target
          </button>
        </div>
      </div>

      {/* Additional sections can be added here later */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="text-center text-gray-500 text-sm">
          More features coming soon...
        </div>
      </div>
    </div>
  );
}