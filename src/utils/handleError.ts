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
      case 'email_not_confirmed':
        return { message: 'Por favor, confirme seu email antes de fazer login', code: error.code };
      case 'signup_disabled':
        return { message: 'Cadastro temporariamente desabilitado', code: error.code };
      case 'weak_password':
        return { message: 'Senha muito fraca. Use pelo menos 8 caracteres com letras, números e símbolos', code: error.code };
      case 'same_password':
        return { message: 'A nova senha deve ser diferente da atual', code: error.code };
      case 'database_error':
        return { message: 'Erro na configuração do banco de dados. Verifique as variáveis de ambiente.', code: error.code };
      case 'invalid_request':
        return { message: 'Dados inválidos. Verifique os campos obrigatórios.', code: error.code };
      case 'email_not_found':
        return { message: 'Email não encontrado. Verifique se você digitou corretamente.', code: error.code };
      case 'too_many_requests':
        return { message: 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.', code: error.code };
      case 'recovery_token_expired':
        return { message: 'Link de recuperação expirado. Solicite um novo link.', code: error.code };
      case 'invalid_recovery_token':
        return { message: 'Link de recuperação inválido. Solicite um novo link.', code: error.code };
      default:
        return { message: error.message || 'Erro de autenticação', code: error.code };
    }
  }
  
  // Handle specific database errors
  if (error.message?.includes('Missing Supabase environment variables')) {
    return { message: 'Configuração do banco não encontrada. Entre em contato com o suporte.', code: 'config_error' };
  }
  
  if (error.message?.includes('profiles')) {
    return { message: 'Erro ao criar perfil do usuário. Tente novamente.', code: 'profile_error' };
  }
  
  return { message: error.message || 'Erro desconhecido' };
}

export function formatValidationErrors(errors: Record<string, any>): string {
  return Object.values(errors).flat().join(', ');
}