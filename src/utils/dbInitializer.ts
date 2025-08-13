import { supabase, financeQueries } from '../lib/supabase';
import { DEFAULT_CATEGORY_GROUPS, DEFAULT_GOALS } from './defaultCategories';

/**
 * Inicializa o orçamento do usuário com categorias e grupos pré-definidos
 * se ele ainda não tiver nenhum grupo de categorias criado.
 */
export async function initializeUserBudget(userId: string): Promise<boolean> {
  try {
    console.log('🚀 [dbInitializer] Iniciando verificação de dados do usuário:', userId);
    
    // Verificar se o usuário já tem grupos de categorias
    const { data: existingGroups, error: groupsError } = await supabase
      .from('category_groups')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    if (groupsError) {
      console.error('❌ [dbInitializer] Erro ao verificar grupos existentes:', groupsError);
      throw groupsError;
    }

    // Se já existem grupos, não fazer nada
    if (existingGroups && existingGroups.length > 0) {
      console.log('✅ [dbInitializer] Usuário já possui dados, pulando inicialização');
      return false;
    }

    console.log('📦 [dbInitializer] Criando dados iniciais para novo usuário...');

    // Criar grupos de categorias e categorias
    for (const groupData of DEFAULT_CATEGORY_GROUPS) {
      console.log(`📁 [dbInitializer] Criando grupo: ${groupData.name}`);
      
      // Criar o grupo
      const { data: newGroup, error: groupError } = await supabase
        .from('category_groups')
        .insert({
          user_id: userId,
          name: groupData.name,
          sort_order: groupData.sort_order,
        })
        .select()
        .single();

      if (groupError) {
        console.error(`❌ [dbInitializer] Erro ao criar grupo ${groupData.name}:`, groupError);
        throw groupError;
      }

      // Criar as categorias do grupo
      const categoriesData = groupData.categories.map(category => ({
        user_id: userId,
        group_id: newGroup.id,
        name: category.name,
        type: category.type,
        budgeted_amount: category.budgeted_amount,
        rollover_enabled: category.rollover_enabled,
        color: category.color,
        icon: category.icon,
        sort_order: category.sort_order,
        is_hidden: false,
      }));

      const { error: categoriesError } = await supabase
        .from('categories')
        .insert(categoriesData);

      if (categoriesError) {
        console.error(`❌ [dbInitializer] Erro ao criar categorias para ${groupData.name}:`, categoriesError);
        throw categoriesError;
      }

      console.log(`✅ [dbInitializer] Grupo ${groupData.name} criado com ${groupData.categories.length} categorias`);
    }

    // Criar metas padrão (opcional - ligadas às categorias de economia)
    console.log('🎯 [dbInitializer] Criando metas padrão...');
    
    // Buscar as categorias de economia criadas para vincular às metas
    const { data: savingCategories, error: savingError } = await supabase
      .from('categories')
      .select('id, name')
      .eq('user_id', userId)
      .eq('type', 'saving');

    if (savingError) {
      console.warn('⚠️ [dbInitializer] Erro ao buscar categorias de economia:', savingError);
    } else if (savingCategories) {
      for (const goalData of DEFAULT_GOALS) {
        // Encontrar a categoria correspondente
        const linkedCategory = savingCategories.find(cat => 
          cat.name === goalData.category_name
        );

        if (linkedCategory) {
          const { error: goalError } = await supabase
            .from('goals')
            .insert({
              user_id: userId,
              category_id: linkedCategory.id,
              name: goalData.name,
              description: goalData.description,
              target_amount: goalData.target_amount,
              current_amount: 0,
              type: goalData.type,
              monthly_contribution: 0,
              is_achieved: false,
              is_active: true,
              color: goalData.color,
            });

          if (goalError) {
            console.warn(`⚠️ [dbInitializer] Erro ao criar meta ${goalData.name}:`, goalError);
          } else {
            console.log(`✅ [dbInitializer] Meta ${goalData.name} criada`);
          }
        }
      }
    }

    console.log('🎉 [dbInitializer] Inicialização completa!');
    return true;

  } catch (error) {
    console.error('💥 [dbInitializer] Erro durante inicialização:', error);
    throw error;
  }
}

/**
 * Verifica se o usuário é novo (não tem dados de orçamento)
 */
export async function isNewUser(userId: string): Promise<boolean> {
  try {
    const { data: groups } = await supabase
      .from('category_groups')
      .select('id')
      .eq('user_id', userId)
      .limit(1);

    return !groups || groups.length === 0;
  } catch (error) {
    console.error('Erro ao verificar se usuário é novo:', error);
    return false;
  }
}

/**
 * Força a recriação dos dados padrão (útil para desenvolvimento/teste)
 */
export async function resetUserBudget(userId: string): Promise<void> {
  try {
    console.log('🔄 [dbInitializer] Resetando dados do usuário...');
    
    // Deletar dados existentes (cascata vai limpar categorias e metas)
    await supabase
      .from('category_groups')
      .delete()
      .eq('user_id', userId);

    // Recriar dados padrão
    await initializeUserBudget(userId);
    
    console.log('✅ [dbInitializer] Reset concluído');
  } catch (error) {
    console.error('❌ [dbInitializer] Erro durante reset:', error);
    throw error;
  }
}