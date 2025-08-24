import { supabase, financeQueries } from '../lib/supabase';

export interface SeedInboxItem {
  description: string;
  amount: number;
  date: string;
  source: string;
  suggestedCategoryName?: string;
}

// Sample inbox items for demonstration
export const SAMPLE_INBOX_ITEMS: SeedInboxItem[] = [
  {
    description: "Pagamento PIX - iFood",
    amount: -35.90,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 1 day ago
    source: "email",
    suggestedCategoryName: "Restaurantes e Lanches"
  },
  {
    description: "Salário Empresa XYZ",
    amount: 4500.00,
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 days ago
    source: "email",
    suggestedCategoryName: undefined // Income, no category needed
  },
  {
    description: "Compra Cartão - Supermercado ABC",
    amount: -127.45,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days ago
    source: "email",
    suggestedCategoryName: "Supermercado/Feira"
  },
  {
    description: "PIX Recebido - João Silva",
    amount: 150.00,
    date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 4 days ago
    source: "email",
    suggestedCategoryName: undefined
  },
  {
    description: "Uber - Corrida Centro",
    amount: -18.50,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days ago
    source: "email",
    suggestedCategoryName: "Transporte Público"
  }
];

/**
 * Seeds inbox items for a user if they don't have any pending items
 */
export async function seedInboxItemsForUser(userId: string): Promise<boolean> {
  try {
    // Check if user already has pending inbox items
    const { data: existingItems, error: checkError } = await supabase
      .from('inbox_items')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .limit(1);

    if (checkError) throw checkError;

    // If user already has pending items, don't seed
    if (existingItems && existingItems.length > 0) {
      return false;
    }

    // Get user's categories to match suggested categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId);

    if (categoriesError) throw categoriesError;

    const categoryMap = new Map();
    categories?.forEach(cat => {
      categoryMap.set(cat.name, cat.id);
    });

    // Create inbox items
    const inboxItemsToCreate = SAMPLE_INBOX_ITEMS.map(item => {
      const suggestedCategoryId = item.suggestedCategoryName 
        ? categoryMap.get(item.suggestedCategoryName) || null
        : null;

      return {
        user_id: userId,
        description: item.description,
        amount: item.amount,
        date: item.date,
        source: item.source,
        suggested_category_id: suggestedCategoryId,
        status: 'pending' as const,
        raw_data: {
          seeded: true,
          original_category_name: item.suggestedCategoryName
        }
      };
    });

    const { error: insertError } = await supabase
      .from('inbox_items')
      .insert(inboxItemsToCreate);

    if (insertError) throw insertError;

    console.log(`✅ Seeded ${inboxItemsToCreate.length} inbox items for user ${userId}`);
    return true;

  } catch (error) {
    console.error('Error seeding inbox items:', error);
    throw error;
  }
}

/**
 * Seeds inbox items for all users that don't have any (useful for development)
 */
export async function seedInboxItemsForAllUsers(): Promise<void> {
  try {
    // Get all users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id');

    if (profilesError) throw profilesError;

    if (!profiles || profiles.length === 0) {
      console.log('No users found to seed');
      return;
    }

    let seededCount = 0;
    for (const profile of profiles) {
      try {
        const wasSeeded = await seedInboxItemsForUser(profile.id);
        if (wasSeeded) seededCount++;
      } catch (error) {
        console.error(`Failed to seed inbox for user ${profile.id}:`, error);
      }
    }

    console.log(`✅ Seeded inbox items for ${seededCount} users`);

  } catch (error) {
    console.error('Error seeding inbox items for all users:', error);
    throw error;
  }
}