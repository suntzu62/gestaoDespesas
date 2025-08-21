import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, TrendingUp, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    let mounted = true;
    let redirectTimeout: NodeJS.Timeout;

    const handleCallback = async () => {
      try {
        console.log('🔄 [AuthCallback] Starting callback processing...');
        setDebugInfo('Iniciando processamento...');

        // Check for errors in URL first
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const errorParam = urlParams.get('error') || hashParams.get('error');
        
        if (errorParam) {
          console.log('❌ [AuthCallback] URL error detected:', errorParam);
          setError('Erro na autenticação. Tente novamente.');
          setTimeout(() => navigate('/signin'), 3000);
          return;
        }

        setDebugInfo('Verificando sessão...');

        // Wait a moment for Supabase to process the OAuth callback
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        console.log('📊 [AuthCallback] Session check:', session ? 'EXISTS' : 'NULL');
        setDebugInfo(`Sessão: ${session ? 'ENCONTRADA' : 'NÃO ENCONTRADA'}`);

        if (session?.user) {
          console.log('✅ [AuthCallback] User found in session, fetching profile...');
          setDebugInfo('Usuário encontrado, buscando perfil...');
          
          // Get user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            // If profile doesn't exist, that's okay - the trigger should create it
            console.log('⚠️ [AuthCallback] Profile not found, but user exists in auth');
          }

          console.log('🎯 [AuthCallback] Redirecting to dashboard...');
          setDebugInfo('Redirecionando para dashboard...');
          
          // Small delay to ensure state is updated
          await new Promise(resolve => setTimeout(resolve, 500));
          
          if (mounted) {
            navigate('/dashboard', { replace: true });
          }
        } else {
          console.log('❌ [AuthCallback] No user in session');
          setDebugInfo('Nenhum usuário encontrado na sessão');
          throw new Error('No user found in session');
        }
      } catch (err: any) {
        console.error('Callback error:', err);
        setError('Erro no processamento da autenticação. Redirecionando...');
        setTimeout(() => {
          if (mounted) {
            navigate('/signin');
          }
        }, 2000);
      }
    };

    // Set a safety timeout
    redirectTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('⚠️ [AuthCallback] Safety timeout - redirecting to signin');
        setError('Tempo limite excedido. Redirecionando...');
        navigate('/signin');
      }
    }, 10000);

    handleCallback();

    return () => {
      mounted = false;
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [navigate]);

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
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
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
        <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left max-w-md mx-auto">
          <p className="text-xs text-gray-600">Debug: {debugInfo}</p>
          <p className="text-xs text-gray-600">URL: {window.location.href.substring(0, 80)}...</p>
        </div>
      </div>
    </div>
  );
}