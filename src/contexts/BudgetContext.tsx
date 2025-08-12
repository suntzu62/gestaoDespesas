import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Category } from '../lib/supabase';

interface BudgetContextType {
  currentDate: Date;
  selectedCategory: Category | null;
  refreshTrigger: number;
  navigateMonth: (direction: 'prev' | 'next') => void;
  setCurrentDate: (date: Date) => void;
  setSelectedCategory: (category: Category | null) => void;
  refreshBudget: () => void;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

interface BudgetContextProviderProps {
  children: ReactNode;
  initialDate?: Date;
}

export function BudgetContextProvider({ children, initialDate = new Date() }: BudgetContextProviderProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const refreshBudget = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const contextValue: BudgetContextType = {
    currentDate,
    selectedCategory,
    refreshTrigger,
    navigateMonth,
    setCurrentDate,
    setSelectedCategory,
    refreshBudget,
  };

  return (
    <BudgetContext.Provider value={contextValue}>
      {children}
    </BudgetContext.Provider>
  );
}

export function useBudgetContext(): BudgetContextType {
  const context = useContext(BudgetContext);
  if (context === undefined) {
    throw new Error('useBudgetContext must be used within a BudgetContextProvider');
  }
  return context;
}