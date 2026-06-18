import { supabase } from './supabase';
import { MissionPlan } from '../types';
const TABLE = 'user_mission_plans';
export async function saveMissionPlan(userId: string, plan: MissionPlan): Promise<boolean> {
  if (!userId) return false;
  const { error } = await supabase
    .from(TABLE)
    .upsert({
      user_id: userId,
      tier: plan.tier,
      goal_title: plan.goalTitle,
      goal_description: plan.goalDescription,
      success_definition: plan.successDefinition,
      start_date: plan.startDate,
      end_date: plan.endDate,
      revenue_goal: plan.revenueGoal,
      constraint1: plan.constraint1,
      constraint2: plan.constraint2,
      constraint3: plan.constraint3,
      phases: plan.phases,
      milestones: plan.milestones,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  return !error;
}
export async function loadMissionPlan(userId: string): Promise<MissionPlan | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error || !data) return null;
  return {
    id: data.id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    tier: data.tier,
    goalTitle: data.goal_title,
    goalDescription: data.goal_description,
    successDefinition: data.success_definition,
    startDate: data.start_date,
    endDate: data.end_date,
    revenueGoal: data.revenue_goal,
    constraint1: data.constraint1,
    constraint2: data.constraint2,
    constraint3: data.constraint3,
    phases: data.phases || [],
    milestones: data.milestones || [],
  };
}
