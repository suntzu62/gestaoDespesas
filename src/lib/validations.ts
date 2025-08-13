import { z } from 'zod';

// Password strength validation
const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(128, 'Senha muito longa (máximo 128 caracteres)')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[^a-zA-Z0-9]/, 'Senha deve conter pelo menos um caractere especial');

export const signUpSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export const signInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido'),
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
});

export type SignUpData = z.infer<typeof signUpSchema>;

// Goal/Target validation schemas
export const goalSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  description: z.string().max(500, 'Descrição muito longa').optional(),
  target_amount: z.number().min(0.01, 'Valor deve ser maior que zero').max(999999999, 'Valor muito alto'),
  target_date: z.string().optional(),
  type: z.enum(['saving_builder', 'target_by_date', 'monthly_funding'], {
    errorMap: () => ({ message: 'Tipo de meta inválido' })
  }),
  monthly_contribution: z.number().min(0, 'Contribuição não pode ser negativa').optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional(),
});

export const createGoalSchema = goalSchema.extend({
  category_id: z.string().min(1, 'Categoria é obrigatória'),
});

export const updateGoalSchema = goalSchema.partial();

export type GoalData = z.infer<typeof goalSchema>;
export type CreateGoalData = z.infer<typeof createGoalSchema>;
export type UpdateGoalData = z.infer<typeof updateGoalSchema>;