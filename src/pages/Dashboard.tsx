import React from 'react';
import { TrendingUp, LogOut, User, Settings, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BudgetSummary } from '../components/BudgetSummary';
import { CategoryTable } from '../components/CategoryTable';
import { TransactionModal } from '../components/TransactionModal';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isTransactionModalOpen, setIsTransactionModalOpen] = React.useState(false);

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
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Olá, {user?.name?.split(' ')[0]}! 👋
                </h1>
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
            {/* Budget Summary */}
            <BudgetSummary />

            {/* Category Budget Table */}
            <CategoryTable onAddTransaction={() => setIsTransactionModalOpen(true)} />
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