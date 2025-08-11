import React, { useState, useEffect } from 'react';
import { Target, Plus, Calendar, TrendingUp, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { supabase, Goal } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface GoalWithProgress extends Goal {
  progress_percentage: number;
  remaining_amount: number;
  estimated_completion_date?: string;
}

export function GoalOverview() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchGoals = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError('');

    try {
      const { data: goalsData, error: goalsError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (goalsError) throw goalsError;

      // Calculate progress for each goal
      const goalsWithProgress: GoalWithProgress[] = goalsData?.map(goal => {
        const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
        const remaining = Math.max(0, goal.target_amount - goal.current_amount);
        
        // Calculate estimated completion date if monthly contribution is set
        let estimatedCompletion = undefined;
        if (goal.monthly_contribution > 0 && remaining > 0) {
          const monthsRemaining = Math.ceil(remaining / goal.monthly_contribution);
          const completionDate = new Date();
          completionDate.setMonth(completionDate.getMonth() + monthsRemaining);
          estimatedCompletion = completionDate.toISOString().split('T')[0];
        }

        return {
          ...goal,
          progress_percentage: Math.min(progress, 100),
          remaining_amount: remaining,
          estimated_completion_date: estimatedCompletion,
        };
      }) || [];

      setGoals(goalsWithProgress);
    } catch (err: any) {
      console.error('Error fetching goals:', err);
      setError('Erro ao carregar metas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, [user?.id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'saving_builder':
        return 'Construtor de Poupança';
      case 'target_by_date':
        return 'Meta com Prazo';
      case 'monthly_funding':
        return 'Contribuição Mensal';
      default:
        return 'Meta';
    }
  };

  const getGoalIcon = (type: string, isAchieved: boolean) => {
    if (isAchieved) return <CheckCircle className="w-5 h-5 text-green-600" />;
    switch (type) {
      case 'saving_builder':
        return <Target className="w-5 h-5 text-blue-600" />;
      case 'target_by_date':
        return <Calendar className="w-5 h-5 text-purple-600" />;
      case 'monthly_funding':
        return <TrendingUp className="w-5 h-5 text-orange-600" />;
      default:
        return <Target className="w-5 h-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin" />
          <span className="ml-2 text-gray-600">Carregando metas...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <div className="text-red-600 mb-2">{error}</div>
          <button
            onClick={fetchGoals}
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Suas Metas</h3>
        <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
          <Plus className="w-4 h-4" />
          Nova Meta
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhuma meta definida</h4>
          <p className="text-gray-500 mb-4">
            Defina suas metas financeiras para acompanhar seu progresso
          </p>
          <button className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Criar primeira meta
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-1">
                  {getGoalIcon(goal.type, goal.is_achieved)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900 truncate">
                        {goal.name}
                      </h4>
                      <div className="text-sm text-gray-500">
                        {getGoalTypeLabel(goal.type)}
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-lg font-bold text-gray-900">
                        {Math.round(goal.progress_percentage)}%
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(goal.current_amount)} / {formatCurrency(goal.target_amount)}
                      </div>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(goal.progress_percentage, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Goal Details */}
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span>Faltam: {formatCurrency(goal.remaining_amount)}</span>
                      {goal.target_date && (
                        <span>
                          Prazo: {new Date(goal.target_date).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                      {goal.monthly_contribution > 0 && (
                        <span>
                          Mensal: {formatCurrency(goal.monthly_contribution)}
                        </span>
                      )}
                    </div>
                    
                    {goal.estimated_completion_date && !goal.is_achieved && (
                      <div className="text-right">
                        <span className="text-xs">Previsão:</span>
                        <br />
                        <span className="font-medium">
                          {new Date(goal.estimated_completion_date).toLocaleDateString('pt-BR', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {goal.is_achieved && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium text-sm">Meta atingida! Parabéns! 🎉</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Statistics */}
      {goals.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.is_achieved).length}
              </div>
              <div className="text-sm text-gray-600">Metas atingidas</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {goals.length - goals.filter(g => g.is_achieved).length}
              </div>
              <div className="text-sm text-gray-600">Em progresso</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(goals.reduce((sum, g) => sum + g.remaining_amount, 0))}
              </div>
              <div className="text-sm text-gray-600">Total restante</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}