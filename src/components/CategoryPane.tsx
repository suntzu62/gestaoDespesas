import React from 'react';
import { BudgetSummary } from './BudgetSummary';
import { BudgetingModule } from './BudgetingModule';

interface CategoryPaneProps {
  currentDate: Date;
}

export function CategoryPane({ currentDate }: CategoryPaneProps) {
  return (
    <div className="relative overflow-y-auto pr-4 space-y-6">
      {/* Budget Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <BudgetSummary currentDate={currentDate} />
      </div>
      
      {/* Budget Module */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <BudgetingModule />
      </div>
    </div>
  );
}