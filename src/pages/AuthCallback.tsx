import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Lidar com parâmetros de erro na URL primeiro
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get('error');
    if (errorParam) {
      setError('Erro na autenticação. Tente novamente.');
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

    // Se a autenticação ainda está carregando, aguarde
    if (loading) {
      return;
    }

    // Se o carregamento estiver completo e um usuário for encontrado, redirecionar para o dashboard
    if (user) {
      const redirectTo = user.role === 'admin' || user.role === 'owner'
        ? '/admin-dashboard'
        : '/dashboard';
      navigate(redirectTo, { replace: true });
      return;
    }

    // Se o carregamento estiver completo e nenhum usuário for encontrado, redirecionar para o signin
    // Isso implica que 'loading' é false devido à verificação acima
    if (!user) {
      navigate('/signin', { replace: true });
    }
  }, [user, loading, navigate]);

  // Exibir estado de carregamento enquanto a autenticação está sendo processada
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
          <div className="mb-4">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Processando...</h2>
          <p className="text-gray-600">Finalizando sua autenticação</p>
        </div>
      </div>
    );
  }

  // Exibir estado de erro se um erro ocorreu
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro de Autenticação</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecionando para o login...</p>
        </div>
      </div>
    );
  }

  // Fallback para estados inesperados (idealmente não deve ser alcançado)
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-green-600" />
        </div>
        <div className="mb-4">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verificando...</h2>
        <p className="text-gray-600">Aguarde enquanto verificamos sua sessão.</p>
      </div>
    </div>
  );
}