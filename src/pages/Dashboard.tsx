import React from 'react';
import { TrendingUp, LogOut, User, Settings, Plus, ChevronLeft, ChevronRight, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BudgetSummary } from '../components/BudgetSummary';
import { CategoryTable } from '../components/CategoryTable';
import { TransactionModal } from '../components/TransactionModal';
import { GoalOverview } from '../components/GoalOverview';
import { ReportsSection } from '../components/ReportsSection';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [lastSyncTime] = React.useState(new Date()); // Placeholder for last sync time

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
    navigate('/');
  };

  const handleTransactionSuccess = () => {
    // Refresh the page data after successful transaction
    window.location.reload();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
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
          {/* Header with Month Navigation */}
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

          <div className="space-y-8">
            {/* Budget Summary - Section 1 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Resumo do Mês</h2>
              <BudgetSummary currentDate={currentDate} />
            </div>

            {/* Category Budget Table - Section 2 */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Orçamento por Categoria</h2>
              <CategoryTable 
                currentDate={currentDate}
                onAddTransaction={() => setIsTransactionModalOpen(true)} 
              />
            </div>

            {/* Goals and Reports - Section 3 */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Relatórios e Análises</h2>
                <ReportsSection currentDate={currentDate} />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Suas Metas</h2>
                <GoalOverview />
              </div>
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