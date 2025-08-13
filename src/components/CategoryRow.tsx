import React, { useState, useEffect } from 'react';
import { 
  Loader2, AlertCircle, Home, Zap, Tv, Shield, GraduationCap, Dumbbell, ShoppingCart, 
  Car, Coffee, Phone, Heart, Music, Gamepad2, Package, DollarSign, Building, 
  Bus, Pill, Utensils, Plane, Shirt, Smartphone, Play 
} from 'lucide-react';
import { Category, Goal, financeQueries } from '../lib/supabase';
import { useBudgetContext } from '../contexts/BudgetContext';
import { useAuth } from '../contexts/AuthContext';

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
    'building': Building,
    'bus': Bus,
    'pill': Pill,
    'utensils': Utensils,
    'plane': Plane,
    'shirt': Shirt,
    'smartphone': Smartphone,
    'play': Play,
  };

  const IconComponent = iconMap[iconName?.toLowerCase() || ''] || Package;
  return IconComponent;
};

export function CategoryRow({ category }: CategoryRowProps) {
  const { user } = useAuth();
  const { selectedCategory, setSelectedCategory } = useBudgetContext();
  const [categoryGoal, setCategoryGoal] = useState<Goal | null>(null);
  const [goalLoading, setGoalLoading] = useState(false);

  const isSelected = selectedCategory?.id === category.id;
  const IconComponent = getIconComponent(category.icon);

  useEffect(() => {
    if (user?.id) {
      fetchCategoryGoal();
    }
  }, [user?.id, category.id]);

  const fetchCategoryGoal = async () => {
    if (!user?.id) return;
    
    setGoalLoading(true);
    try {
      const goal = await financeQueries.getGoalForCategory(user.id, category.id);
      setCategoryGoal(goal);
    } catch (error) {
      console.error('Error fetching category goal:', error);
      setCategoryGoal(null);
    } finally {
      setGoalLoading(false);
    }
  };

  const handleRowClick = () => {
    setSelectedCategory(category);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getGoalStatus = () => {
    if (goalLoading) {
      return <span className="text-gray-500 text-sm">Carregando...</span>;
    }

    if (!categoryGoal) {
      return <span className="text-gray-500 text-sm">Sem meta</span>;
    }

    const progress = categoryGoal.target_amount > 0 ? 
      (categoryGoal.current_amount / categoryGoal.target_amount) * 100 : 0;
    
    if (progress >= 100) {
      return <span className="text-green-600 text-sm font-medium">Meta atingida! 🎉</span>;
    }

    const remaining = categoryGoal.target_amount - categoryGoal.current_amount;
    return (
      <div className="text-right">
        <div className="text-sm text-gray-600">
          {formatCurrency(categoryGoal.current_amount)} / {formatCurrency(categoryGoal.target_amount)}
        </div>
        <div className="text-xs text-gray-500">
          Faltam {formatCurrency(remaining)}
        </div>
      </div>
    );
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

      {/* Goal Status */}
      {getGoalStatus()}
    </div>
  );
}