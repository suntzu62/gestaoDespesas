import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleCallback = () => {
      // Check for error in URL params
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      
      if (errorParam) {
        setError('Erro na autenticação. Tente novamente.');
        setTimeout(() => navigate('/signin'), 3000);
        return;
      }

      // If we have a user, redirect based on role
      if (user) {
        const redirectTo = user.role === 'admin' || user.role === 'owner' 
          ? '/admin-dashboard' 
          : '/dashboard';
        navigate(redirectTo, { replace: true });
        return;
      }

      // If not loading and no user, redirect to signin
      if (!loading && !user) {
        navigate('/signin', { replace: true });
      }
    };

    // Small delay to allow auth state to settle
    const timer = setTimeout(handleCallback, 1000);
    return () => clearTimeout(timer);
  }, [user, loading, navigate]);

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