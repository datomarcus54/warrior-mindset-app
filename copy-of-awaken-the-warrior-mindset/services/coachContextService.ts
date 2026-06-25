import { UserData, HealthMetrics, MealAnalysis } from '../types';
import { loadUserAppState } from './userAppStateService';
import { loadMissionPlan } from './missionPlanService';

/** Ageless Living stores meals at health.mealLogs (not health.nutrition). */
function mergeHealthMetrics(local: HealthMetrics, cloud: HealthMetrics): HealthMetrics {
  const localNewer = (local.lastUpdated || '') >= (cloud.lastUpdated || '');
  const base = localNewer ? { ...cloud, ...local } : { ...local, ...cloud };
  // mealLogs always from local — cloud sync is debounced (~1s) and too stale for today's meals
  return {
    ...base,
    mealLogs: local.mealLogs ?? cloud.mealLogs ?? [],
  };
}

/** Merge cloud app state over local React state for Coach Marcus prompts. */
export function mergeCoachUserData(localData: UserData, cloudData: UserData): UserData {
  const pf = cloudData.financialData || localData.financialData;
  return {
    ...localData,
    ...cloudData,
    health: mergeHealthMetrics(localData.health, cloudData.health),
    financialData: {
      ...localData.financialData,
      ...pf,
      assets: { ...localData.financialData.assets, ...(pf.assets || {}) },
      liabilities: { ...localData.financialData.liabilities, ...(pf.liabilities || {}) },
      expenses: {
        fixed: pf.expenses?.fixed ?? localData.financialData.expenses.fixed,
        mandatory: pf.expenses?.mandatory ?? localData.financialData.expenses.mandatory,
        variable: pf.expenses?.variable ?? localData.financialData.expenses.variable,
      },
      income: pf.income ?? localData.financialData.income,
    },
    dailyWorkflows: cloudData.dailyWorkflows ?? localData.dailyWorkflows,
  };
}

/** Fetch latest Supabase data before Coach Marcus responds; falls back to local state. */
export async function loadCoachContextData(userId: string, localData: UserData): Promise<UserData> {
  if (!userId) return localData;

  let merged = localData;

  try {
    const cloudData = await loadUserAppState(userId);
    if (cloudData) {
      console.log('[coachContextService] Fetched app_data.health.mealLogs:', cloudData.health?.mealLogs);
      console.log('[coachContextService] Fetched app_data (health only):', JSON.stringify(cloudData.health, null, 2));
      console.log('[coachContextService] Local health.mealLogs before merge:', localData.health?.mealLogs);
      merged = mergeCoachUserData(localData, cloudData);
      console.log('[coachContextService] Merged health.mealLogs after merge:', merged.health?.mealLogs);
    }
  } catch (err) {
    console.warn('[coachContextService] Cloud app state unavailable, using local data:', err);
  }

  try {
    const missionPlan = await loadMissionPlan(userId);
    if (missionPlan) merged = { ...merged, missionPlan };
  } catch (err) {
    console.warn('[coachContextService] Mission plan unavailable:', err);
  }

  return merged;
}
