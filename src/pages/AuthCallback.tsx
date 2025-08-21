import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function AuthCallback() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    console.log('🔄 [AuthCallback] useEffect triggered', { user: user ? 'EXISTS' : 'NULL', loading });
    setDebugInfo(`Loading: ${loading}, User: ${user ? 'EXISTS' : 'NULL'}`);
    
    // 1. Lidar com parâmetros de erro na URL primeiro
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const errorParam = urlParams.get('error');
    const hashError = hashParams.get('error');
    
    if (errorParam) {
      console.log('❌ [AuthCallback] URL error detected:', errorParam);
      setError('Erro na autenticação. Tente novamente.');
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

    if (hashError) {
      console.log('❌ [AuthCallback] Hash error detected:', hashError);
      setError('Erro na autenticação OAuth. Tente novamente.');
      setTimeout(() => navigate('/signin'), 3000);
      return;
    }

    // Check if we have an access token in the URL hash
    const accessToken = hashParams.get('access_token');
    if (accessToken) {
      console.log('🔑 [AuthCallback] Access token found in URL hash');
      setDebugInfo(prev => prev + ' | Token in URL: YES');
    }

    // 2. Somente prossiga se o estado de autenticação terminou de carregar
    if (!loading) {
      console.log('✅ [AuthCallback] Loading complete, checking user...');
      if (user) {
        // Usuário autenticado, redirecionar para o dashboard
        console.log(`🎯 [AuthCallback] User authenticated, redirecting to dashboard. Role: ${user.role}`);
        const redirectTo = user.role === 'admin' || user.role === 'owner'
          ? '/admin-dashboard'
          : '/dashboard';
        navigate(redirectTo, { replace: true });
      } else {
        // Autenticação finalizada, mas nenhum usuário encontrado (ex: login falhou, sem sessão)
        console.log('❌ [AuthCallback] Loading complete but no user found, redirecting to signin');
        navigate('/signin', { replace: true });
      }
    } else {
      console.log('⏳ [AuthCallback] Still loading, waiting...');
    }
    // Se 'loading' for true, o componente exibirá o estado de carregamento
    // e aguardará a atualização de 'user'/'loading'.
  }, [user, loading, navigate]);

  // Add a safety timeout for the callback itself
  useEffect(() => {
    const callbackTimeout = setTimeout(() => {
      if (loading) {
        console.warn('⚠️ [AuthCallback] Callback timeout - forcing redirect to signin');
        setError('Tempo limite de autenticação excedido. Tente novamente.');
        setTimeout(() => navigate('/signin'), 2000);
      }
    }, 15000); // 15 seconds timeout

    return () => clearTimeout(callbackTimeout);
  }, [loading, navigate]);

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
          {/* Debug info */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
            <p className="text-xs text-gray-600">URL: {window.location.href.substring(0, 100)}...</p>
          </div>
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
        {/* Debug info during processing */}
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
          <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
          <p className="text-xs text-gray-600">URL: {window.location.href.substring(0, 80)}...</p>
        </div>
      </div>
    </div>
  );
}