// Definição das categorias e grupos pré-montados para usuários brasileiros
import { CategoryType, GoalType } from '../lib/supabase';

export interface DefaultCategoryGroup {
  name: string;
  sort_order: number;
  categories: DefaultCategory[];
}

export interface DefaultCategory {
  name: string;
  type: CategoryType;
  budgeted_amount: number;
  rollover_enabled: boolean;
  color: string;
  icon: string;
  sort_order: number;
}

export interface DefaultGoal {
  name: string;
  description: string;
  target_amount: number;
  type: GoalType;
  color: string;
  category_name?: string; // Referência para vincular a uma categoria específica
export type GoalType = 'save_by_date' | 'save_monthly' | 'spend_monthly';

export const DEFAULT_CATEGORY_GROUPS: DefaultCategoryGroup[] = [
  {
    name: "Despesas Fixas",
    sort_order: 1,
    categories: [
      {
        name: "Aluguel/Financiamento",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#DC2626",
        icon: "home",
        sort_order: 1,
      },
      {
        name: "Condomínio",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#DC2626",
        icon: "building",
        sort_order: 2,
      },
      {
        name: "Água e Luz",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#F59E0B",
        icon: "zap",
        sort_order: 3,
      },
      {
        name: "Telefone/Internet/TV",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#3B82F6",
        icon: "phone",
        sort_order: 4,
      },
      {
        name: "Seguro Saúde/Odonto",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#10B981",
        icon: "heart",
        sort_order: 5,
      },
    ],
  },
  {
    name: "Necessidades",
    sort_order: 2,
    categories: [
      {
        name: "Supermercado/Feira",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#10B981",
        icon: "shopping-cart",
        sort_order: 1,
      },
      {
        name: "Transporte Público",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#6366F1",
        icon: "bus",
        sort_order: 2,
      },
      {
        name: "Combustível/Carro",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#EF4444",
        icon: "car",
        sort_order: 3,
      },
      {
        name: "Farmácia/Medicamentos",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#EC4899",
        icon: "pill",
        sort_order: 4,
      },
      {
        name: "Educação",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#8B5CF6",
        icon: "graduation-cap",
        sort_order: 5,
      },
      {
        name: "Serviços Domésticos",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#F97316",
        icon: "home",
        sort_order: 6,
      },
    ],
  },
  {
    name: "Desejos",
    sort_order: 3,
    categories: [
      {
        name: "Restaurantes e Lanches",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#F59E0B",
        icon: "utensils",
        sort_order: 1,
      },
      {
        name: "Lazer (Cinema, Shows)",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#8B5CF6",
        icon: "music",
        sort_order: 2,
      },
      {
        name: "Viagens e Passeios",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#06B6D4",
        icon: "plane",
        sort_order: 3,
      },
      {
        name: "Compras (Roupas)",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#EC4899",
        icon: "shirt",
        sort_order: 4,
      },
      {
        name: "Tecnologia/Gadgets",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#6366F1",
        icon: "smartphone",
        sort_order: 5,
      },
      {
        name: "Assinaturas (Streaming)",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#EF4444",
        icon: "play",
        sort_order: 6,
      },
      {
        name: "Hobbies (Esporte, Arte)",
        type: "spending",
        budgeted_amount: 0,
        rollover_enabled: false,
        color: "#10B981",
        icon: "dumbbell",
        sort_order: 7,
      },
    ],
  },
  {
    name: "Metas de Economia",
    sort_order: 4,
    categories: [
      {
        name: "Fundo de Emergência",
        type: "saving",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#10B981",
        icon: "shield",
        sort_order: 1,
      },
      {
        name: "Viagem dos Sonhos",
        type: "saving",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#06B6D4",
        icon: "plane",
        sort_order: 2,
      },
      {
        name: "Troca de Carro",
        type: "saving",
        budgeted_amount: 0,
        rollover_enabled: true,
        color: "#F59E0B",
        icon: "car",
        sort_order: 3,
      },
    ],
  },
];

export const DEFAULT_GOALS: DefaultGoal[] = [
  {
    name: "Fundo de Emergência",
    description: "Reserve de 3 a 6 meses de gastos para emergências",
    target_amount: 10000,
    type: "save_by_date",
    color: "#10B981",
    category_name: "Fundo de Emergência",
  },
  {
    name: "Viagem dos Sonhos",
    description: "Economize para aquela viagem especial",
    target_amount: 8000,
    type: "save_by_date",
    color: "#06B6D4",
    category_name: "Viagem dos Sonhos",
  },
  {
    name: "Troca de Carro",
    description: "Junte dinheiro para a entrada do carro novo",
    target_amount: 15000,
    type: "save_monthly",
    color: "#F59E0B",
    category_name: "Troca de Carro",
  },
];

// Cores padrão para categorias (caso não especificado)
export const DEFAULT_CATEGORY_COLORS = [
  "#EF4444", // Red
  "#F59E0B", // Orange
  "#10B981", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#6366F1", // Indigo
];

// Ícones mais utilizados para categorias
export const POPULAR_CATEGORY_ICONS = [
  "home", "car", "shopping-cart", "utensils", "heart", "phone",
  "zap", "graduation-cap", "plane", "shield", "music", "dumbbell",
  "smartphone", "play", "pill", "shirt", "bus", "building"
];