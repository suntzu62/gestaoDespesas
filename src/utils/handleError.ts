import { AuthError } from '@supabase/supabase-js';

export interface ErrorResponse {
  message: string;
  code?: string;
}

export function handleAuthError(error: AuthError | Error): ErrorResponse {
  if ('code' in error && error.code) {
    switch (error.code) {
      case 'email_already_exists':
        return { message: 'Este email já está cadastrado', code: error.code };
      case 'invalid_credentials':
        return { message: 'Email ou senha incorretos', code: error.code };
      case 'signup_disabled':
        return { message: 'Cadastro temporariamente desabilitado', code: error.code };
      default:
        return { message: error.message || 'Erro de autenticação', code: error.code };
    }
  }
  
  return { message: error.message || 'Erro desconhecido' };
}

export function formatValidationErrors(errors: Record<string, any>): string {
  return Object.values(errors).flat().join(', ');
}