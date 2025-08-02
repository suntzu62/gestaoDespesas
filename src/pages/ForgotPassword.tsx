import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Mail, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '../lib/supabase';
import { forgotPasswordSchema } from '../lib/validations';
import { handleAuthError } from '../utils/handleError';

type ForgotPasswordData = {
  email: string;
};

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleForgotPassword = async (data: ForgotPasswordData) => {
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/update-password?from=reset`,
      });

      if (error) throw error;

      setSuccess(true);
      
      // Start countdown to prevent spam
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      const errorResponse = handleAuthError(err);
      setError(errorResponse.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    if (countdown > 0) return;
    
    const email = getValues('email');
    if (!email) return;
    
    await handleForgotPassword({ email });
  };
  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Email enviado!</h2>
            <p className="text-gray-600 mb-6">
              Enviamos um link para redefinir sua senha para <strong>{getValues('email')}</strong>. 
              Verifique sua caixa de entrada e pasta de spam.
            </p>
            <div className="space-y-4 text-center">
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm">
                <strong>Não recebeu o email?</strong>
                <ul className="mt-2 space-y-1 text-left">
                  <li>• Verifique sua pasta de spam</li>
                  <li>• Aguarde alguns minutos</li>
                  <li>• Confirme se o email está correto</li>
                </ul>
              </div>
              
              <button
                onClick={handleResendEmail}
                disabled={countdown > 0}
                className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {countdown > 0 ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Reenviar em {countdown}s
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Reenviar email
                  </>
                )}
              </button>
              
              <Link
                to="/signin"
                className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar para o login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center space-x-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">BolsoZen</span>
          </Link>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Esqueceu sua senha?</h2>
          <p className="text-gray-600">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow-lg rounded-lg border border-gray-100">
          <form onSubmit={handleSubmit(handleForgotPassword)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  {...register('email')}
                  type="email"
                  id="email"
                  autoFocus
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {loading && <Mail className="w-5 h-5 animate-spin" />}
              Enviar link de recuperação
            </button>
            
            <div className="text-sm text-gray-500 text-center">
              Lembre-se de verificar sua pasta de spam caso não receba o email
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar para o login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}