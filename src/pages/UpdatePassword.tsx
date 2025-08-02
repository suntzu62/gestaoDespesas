import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { TrendingUp, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { handleAuthError } from '../utils/handleError';
import { AuthForm } from '../components/AuthForm';

type UpdatePasswordData = {
  password: string;
  confirmPassword: string;
};

export function UpdatePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [validToken, setValidToken] = useState<boolean | null>(null);
  const [isCheckingToken, setIsCheckingToken] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const checkSession = async () => {
      setIsCheckingToken(true);
      try {
        // Check if we have the necessary URL parameters for password reset
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const type = searchParams.get('type');
        
        if (type !== 'recovery' || !accessToken) {
          throw new Error('Invalid recovery link');
        }
        
        // Set the session with the tokens from URL
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        });
        
        if (error) throw error;
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        // Check if we have a valid session for password recovery
        if (data.session && data.session.user) {
          setValidToken(true);
        } else {
          setValidToken(false);
          setError('Link de recuperação inválido ou expirado');
        }
      } catch (err: any) {
        console.error('Error checking session:', err);
        setValidToken(false);
        setError('Link de recuperação inválido ou expirado');
      }
      setIsCheckingToken(false);
    };

    checkSession();
  }, []);

  const handleUpdatePassword = async (data: UpdatePasswordData) => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Clear URL parameters and redirect to dashboard after 3 seconds
      setTimeout(() => {
        // Clear the URL parameters
        window.history.replaceState({}, document.title, '/update-password');
        navigate('/dashboard');
      }, 3000);
    } catch (err: any) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingToken || validToken === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Verificando link de recuperação...</p>
        </div>
      </div>
    );
  }

  if (!validToken) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Inválido</h2>
          <p className="text-gray-600 mb-6">
            {error || 'O link de redefinição de senha é inválido ou expirou.'}
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

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Senha atualizada!</h2>
          <p className="text-gray-600 mb-6">
            Sua senha foi alterada com sucesso. Redirecionando para o dashboard...
          </p>
          <Loader2 className="w-6 h-6 text-green-600 animate-spin mx-auto" />
        </div>
      </div>
    );
  }

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