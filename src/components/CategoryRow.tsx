import React, { useState, useEffect } from 'react';
import { Loader2, AlertCircle, Home, Zap, Tv, Shield, GraduationCap, Dumbbell, ShoppingCart, Car, Coffee, Phone, Heart, Music, Gamepad2, Package, DollarSign } from 'lucide-react';
import { Category } from '../lib/supabase';
import { useBudgetContext } from '../contexts/BudgetContext';

interface CategoryRowProps {
  category: Category;
}

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

export function CategoryRow({ category }: CategoryRowProps) {
  const { selectedCategory, setSelectedCategory } = useBudgetContext();
  const [loading, setLoading] = useState(false);

  const isSelected = selectedCategory?.id === category.id;
  const IconComponent = getIconComponent(category.icon);

  const handleRowClick = () => {
    setSelectedCategory(category);
  };

  return (
    <div
      onClick={handleRowClick}
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 group ${
        isSelected
          ? 'bg-blue-50 border border-blue-200'
          : 'hover:bg-gray-50 border border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Category Icon */}
        <div className="flex-shrink-0">
          <IconComponent 
            className={`w-5 h-5 ${
              isSelected ? 'text-blue-600' : 'text-gray-600'
            }`}
          />
        </div>
        
        {/* Category Name */}
        <span className={`font-medium ${
          isSelected ? 'text-blue-900' : 'text-gray-900'
        }`}>
          {category.name}
        </span>
      </div>

      {/* Target Status */}
      <div className="text-right">
        <span className="text-gray-500 text-sm">
          No target
        </span>
      </div>
    </div>
  );
}