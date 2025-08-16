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
export type SignInData = z.infer<typeof signInSchema>;

// Goal/Target validation schemas - Updated for new MVP approach
export const goalSchema = z.object({
  type: z.enum(['save_by_date', 'save_monthly', 'spend_monthly'], {
    errorMap: () => ({ message: 'Tipo de meta inválido' })
  }),
  target_amount: z.number().min(0.01, 'Valor deve ser maior que zero').max(999999999, 'Valor muito alto'),
  due_date: z.string().optional(),
  cadence: z.enum(['monthly', 'weekly']).optional(),
  note: z.string().max(500, 'Nota muito longa').optional(),
});

export const createGoalSchema = goalSchema.extend({
  category_id: z.string().min(1, 'Categoria é obrigatória'),
});

export const updateGoalSchema = goalSchema;

export const goalContributionSchema = z.object({
  amount: z.number().refine(val => val !== 0, 'Valor não pode ser zero'),
  date: z.string().min(1, 'Data é obrigatória'),
  note: z.string().max(200, 'Nota muito longa').optional(),
});

export type GoalData = z.infer<typeof goalSchema>;
export type CreateGoalData = z.infer<typeof createGoalSchema>;
export type UpdateGoalData = z.infer<typeof updateGoalSchema>;
export type GoalContributionData = z.infer<typeof goalContributionSchema>;

// Category Group validation schemas
export const categoryGroupSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  sort_order: z.number().min(0, 'Ordem deve ser maior ou igual a 0').optional(),
});

export const createCategoryGroupSchema = categoryGroupSchema;
export const updateCategoryGroupSchema = categoryGroupSchema.partial();

export type CategoryGroupData = z.infer<typeof categoryGroupSchema>;
export type CreateCategoryGroupData = z.infer<typeof createCategoryGroupSchema>;
export type UpdateCategoryGroupData = z.infer<typeof updateCategoryGroupSchema>;

// Category validation schemas
export const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres').max(100, 'Nome muito longo'),
  type: z.enum(['spending', 'saving', 'income'], {
    errorMap: () => ({ message: 'Tipo de categoria inválido' })
  }),
  group_id: z.string().optional(),
  parent_category_id: z.string().optional(),
  budgeted_amount: z.number().min(0, 'Valor orçado não pode ser negativo').optional(),
  rollover_enabled: z.boolean().optional(),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor deve estar no formato hexadecimal (#RRGGBB)').optional(),
  icon: z.string().optional(),
  sort_order: z.number().min(0, 'Ordem deve ser maior ou igual a 0').optional(),
});

export const createCategorySchema = categorySchema;
export const updateCategorySchema = categorySchema.partial();

export type CategoryData = z.infer<typeof categorySchema>;
export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;