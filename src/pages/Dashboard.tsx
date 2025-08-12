import React from 'react';
import { TrendingUp, LogOut, User, Settings, Plus, ChevronLeft, ChevronRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BudgetContextProvider, useBudgetContext } from '../contexts/BudgetContext';
import { useNavigate } from 'react-router-dom';
import { BudgetSummary } from '../components/BudgetSummary';
import { BudgetingModule } from '../components/BudgetingModule';
import { TransactionModal } from '../components/TransactionModal';
// import { GoalOverview } from '../components/GoalOverview';
// import { ReportsSection } from '../components/ReportsSection';

function InspectorPanelPlaceholder() {
  const { selectedCategory } = useBudgetContext();
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Inspector</h3>
      {selectedCategory ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-6 h-6 rounded-full"
              style={{ backgroundColor: selectedCategory.color }}
            />
            <h4 className="font-medium text-gray-900">{selectedCategory.name}</h4>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Detalhes da categoria selecionada aparecerão aqui.
          </p>
          <div className="space-y-3">
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700">📊 Mini-gráfico histórico</div>
              <div className="text-xs text-gray-500">Últimos 6 meses de planejado vs gasto</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700">🎯 Gerenciamento de metas</div>
              <div className="text-xs text-gray-500">Criar e editar metas para esta categoria</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="text-sm font-medium text-gray-700">💡 Dicas contextuais</div>
              <div className="text-xs text-gray-500">Insights baseados no comportamento de gastos</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-gray-900 font-medium mb-2">Nenhuma categoria selecionada</h4>
          <p className="text-gray-500 text-sm">
            Selecione uma categoria para ver detalhes, histórico e gerenciar metas.
          </p>
        </div>
      )}
    </div>
  );
}

// Internal Dashboard component that uses the context
function DashboardContent() {
  const { user, signOut } = useAuth();
  const { currentDate, navigateMonth, refreshBudget } = useBudgetContext();
  const navigate = useNavigate();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);
  const [lastSyncTime] = React.useState(new Date());

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate('/');
  };

  const handleTransactionSuccess = () => {
    // Refresh budget data after successful transaction
    refreshBudget();
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold text-gray-900">BolsoZen</span>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {user?.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                  )}
                  <span className="text-gray-700 font-medium hidden sm:inline">{user?.name}</span>
                </div>
                
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </button>
                
                <button 
                  onClick={handleSignOut}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Sair"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header with Month Navigation and Summary */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Olá, {user?.name?.split(' ')[0]}! 👋
                </h1>
                <div className="flex items-center gap-4 mt-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl font-semibold text-gray-700 min-w-48 text-center capitalize">
                    {formatMonthYear(currentDate)}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
                <p className="text-gray-600 mt-2">
                  Bem-vindo ao seu painel de controle financeiro
                </p>
              </div>
              
              <button
                onClick={() => setIsTransactionModalOpen(true)}
                className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Nova Transação
              </button>
            </div>
          </div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Budget Module (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Budget Summary */}
              <BudgetSummary currentDate={currentDate} />
              
              {/* Budget Module */}
              <BudgetingModule />
            </div>

            {/* Right Column - Inspector Panel (1/3 width) */}
            <div className="lg:col-span-1">
              <InspectorPanelPlaceholder />
            </div>
          </div>
        </main>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />
    </>
  );
}

// Main Dashboard component with BudgetContextProvider
export function Dashboard() {
  return (
    <BudgetContextProvider>
      <DashboardContent />
    </BudgetContextProvider>
  );
}