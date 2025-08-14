import React from 'react';
import { TrendingUp, LogOut, User, Settings, Plus, ChevronLeft, ChevronRight, RefreshCw, Wifi, WifiOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BudgetContextProvider, useBudgetContext } from '../contexts/BudgetContext';
import { useNavigate } from 'react-router-dom';
import { BudgetSummary } from '../components/BudgetSummary';
import { BudgetingModule } from '../components/BudgetingModule';
import { TransactionModal } from '../components/TransactionModal';
import { InspectorPanel } from '../components/InspectorPanel';
import { OnboardingSteps } from '../components/OnboardingSteps';
import { initializeUserBudget } from '../utils/dbInitializer';
// import { GoalOverview } from '../components/GoalOverview';
// import { ReportsSection } from '../components/ReportsSection';

// Internal Dashboard component that uses the context
function DashboardContent() {
  const { user, signOut } = useAuth();
  const { currentDate, navigateMonth, refreshBudget } = useBudgetContext();
  const navigate = useNavigate();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);
  const [lastSyncTime] = React.useState(new Date());
  const [isInitializing, setIsInitializing] = React.useState(true);
  const [initializationError, setInitializationError] = React.useState<string>('');

  // Initialize user budget data on first load
  React.useEffect(() => {
    let mounted = true;

    const initializeBudget = async () => {
      if (!user?.id) return;

      try {
        console.log('🚀 [Dashboard] Inicializando dados do usuário...');
        setIsInitializing(true);
        setInitializationError('');

        const wasInitialized = await initializeUserBudget(user.id);
        
        if (wasInitialized) {
          console.log('✅ [Dashboard] Dados iniciais criados, atualizando interface...');
          refreshBudget(); // Refresh the budget data after initialization
        } else {
          console.log('ℹ️ [Dashboard] Usuário já possui dados');
        }
      } catch (error) {
        console.error('❌ [Dashboard] Erro na inicialização:', error);
        if (mounted) {
          setInitializationError('Erro ao inicializar dados do orçamento');
        }
      } finally {
        if (mounted) {
          setIsInitializing(false);
        }
      }
    };

    initializeBudget();

    return () => {
      mounted = false;
    };
  }, [user?.id, refreshBudget]);

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
    <div className="min-h-screen bg-gray-50 flex flex-col">
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

        <main className="flex-1 flex min-h-0">
          {/* Left Column - Scrollable Content */}
          <div className="flex-1 overflow-y-auto py-8 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-5xl mx-auto">
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

              {/* Initialization Loading State */}
              {isInitializing && (
                <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <h3 className="font-semibold text-blue-900">Preparando seu orçamento...</h3>
                      <p className="text-blue-700 text-sm">
                        Configurando suas categorias e grupos iniciais
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Initialization Error */}
              {initializationError && (
                <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-6">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-900">Erro na inicialização</h3>
                      <p className="text-red-700 text-sm">{initializationError}</p>
                      <button 
                        onClick={() => window.location.reload()} 
                        className="text-red-600 hover:text-red-700 font-medium text-sm mt-1"
                      >
                        Tentar novamente
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="space-y-6">
                {/* Budget Summary */}
                <BudgetSummary currentDate={currentDate} />
                
                {/* Budget Module */}
                <BudgetingModule />
              </div>
            </div>
          </div>

          {/* Right Column - Fixed Inspector Panel */}
          <div className="w-96 bg-white shadow-lg border-l border-gray-200 overflow-y-auto flex-shrink-0">
            <InspectorPanel />
          </div>
        </main>

        {/* Onboarding Steps (Fixed at bottom) */}
        <OnboardingSteps />
    </div>

    {/* Transaction Modal */}
    <TransactionModal
      isOpen={isTransactionModalOpen}
      onClose={() => setIsTransactionModalOpen(false)}
      onSuccess={handleTransactionSuccess}
    />
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