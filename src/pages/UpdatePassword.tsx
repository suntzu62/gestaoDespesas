import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleAuthError } from '../utils/handleError';
import { AuthForm } from '../components/AuthForm';
import { useEffect } from 'react';

type UpdatePasswordData = {
  password: string;
  confirmPassword: string;
};

export function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [isRecoverySession, setIsRecoverySession] = useState(false);
  const [isLinkChecked, setIsLinkChecked] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('🔄 [UpdatePassword] Auth state change:', { event, session: session ? 'EXISTS' : 'NULL' });
        
        if (event === 'PASSWORD_RECOVERY') {
          console.log('🔑 [UpdatePassword] Password recovery event detected');
          setIsRecoverySession(true);
          setIsLinkChecked(true);
        } else if (event === 'SIGNED_IN' && session?.user && window.location.hash.includes('type=recovery')) {
          console.log('🔑 [UpdatePassword] Signed in via recovery link');
          setIsRecoverySession(true);
          setIsLinkChecked(true);
        } else if (event === 'SIGNED_OUT' || (event === 'INITIAL_SESSION' && !session)) {
          console.log('❌ [UpdatePassword] No recovery session detected');
          setIsLinkChecked(true);
        }
      }
    );

    // Timeout de segurança para evitar carregamento infinito
    const timeout = setTimeout(() => {
      if (mounted && !isLinkChecked) {
        console.warn('⏰ [UpdatePassword] Timeout - marking link as checked');
        setIsLinkChecked(true);
      }
    }, 5000);
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [isLinkChecked]);

  const handleUpdatePassword = async (data: UpdatePasswordData) => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Limpar parâmetros da URL e redirecionar para login após 3 segundos
      setTimeout(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        navigate('/signin');
      }, 3000);
    } catch (err: any) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  // Se ainda estamos verificando o link, mostra carregamento
  if (!isLinkChecked) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  // Se a senha foi atualizada com sucesso
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Senha atualizada!</h2>
          <p className="text-gray-600 mb-6">
            Sua senha foi alterada com sucesso. Redirecionando para o login...
          </p>
          <Loader2 className="w-6 h-6 text-green-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  // Se não for um link de recuperação válido
  if (!isRecoverySession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600 mb-6">
            O link de redefinição de senha é inválido ou expirou.
          </p>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm">
              <strong>Possíveis causas:</strong>
              <ul className="mt-2 space-y-1 text-left">
                <li>• O link expirou (válido por 1 hora)</li>
                <li>• O link já foi usado</li>
                <li>• O link foi copiado incorretamente</li>
              </ul>
            </div>
            <button
              onClick={() => navigate('/forgot-password')}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Solicitar novo link
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar o formulário de nova senha
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Nova senha</h2>
          <p className="text-gray-600">
            Digite sua nova senha abaixo. Ela deve ser forte e única.
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-100">
          <div className="mb-6 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
            <strong>Dicas para uma senha segura:</strong>
            <ul className="mt-2 space-y-1">
              <li>• Pelo menos 8 caracteres</li>
              <li>• Misture letras maiúsculas e minúsculas</li>
              <li>• Inclua números e símbolos</li>
              <li>• Evite informações pessoais</li>
            </ul>
          </div>
          
          <AuthForm
            mode="update-password"
            onSubmit={handleUpdatePassword}
            loading={loading}
            error={error}
          />
          
          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}