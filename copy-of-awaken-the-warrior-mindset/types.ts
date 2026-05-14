
export interface LifeDomain {
  name: string;
  value: number;
}

export interface Milestone {
  id: string;
  text: string;
  progress: number; // 0-100
}

export interface Goal {
  id: string;
  text: string;
  category: 'Big Vision' | 'Mid-Range' | 'Short-Term' | 'Weekly';
  completed: boolean;
  milestones: Milestone[];
}

export interface Habit {
  id: string;
  name: string;
  streak: number;
  lastCompleted: string | null;
}

export interface Challenge {
  id: string;
  description: string;
  stage: 'Acknowledge' | 'Accept' | 'Analyze' | 'Act' | 'Adapt';
}

export interface JournalEntry {
  id: string;
  distorted: string;
  balanced: string;
  timestamp: string;
}

export interface MealAnalysis {
  timestamp: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  description: string;
}

export interface FinancialEntry {
  label: string;
  target: number;
  actual: number;
}

export interface AssetEntry {
  label: string;
  value: number;
}

export interface FinancialData {
  lastUpdated: string;
  income: FinancialEntry[];
  expenses: {
    fixed: FinancialEntry[];
    mandatory: FinancialEntry[];
    variable: FinancialEntry[];
  };
  assets: {
    liquid: AssetEntry[];
    fixed: AssetEntry[];
  };
  liabilities: {
    shortTerm: AssetEntry[];
    longTerm: AssetEntry[];
  };
}

export type WorkoutCategory = 'Cardio' | 'HIIT' | 'Resistance' | 'Stretching';

export interface WorkoutSession {
  id: string;
  category: WorkoutCategory;
  minutes: number;
  calories: number;
  timestamp: string;
}

export interface DailyHealthLog {
  date: string; // YYYY-MM-DD
  workouts: WorkoutSession[];
  fastingHours: number; // 0 if no fast completed that day
  fastingCompleted: boolean;
  sleepScore?: number;
}

export interface HealthMetrics {
  zone2MinutesWeekly: number; 
  lastUpdated: string; 
  dailyLogs: DailyHealthLog[]; 
  vo2MaxToday: boolean;
  strengthToday: boolean;
  stabilityToday: boolean;
  rpeToday: number;
  waterIntakeMl: number;
  fastingStart: string | null; 
  fastingWindowHours: 10 | 12;
  mealLogs: MealAnalysis[];
  supplementsList: string[];
  supplementLogsToday: { [name: string]: boolean };
  sleep: string;
  timeAsleepHours: number;
  timeAsleepMinutes: number;
  timeInBedHours: number;
  timeInBedMinutes: number;
  deepSleepHours: number;
  deepSleepMinutes: number;
  remSleepHours: number;
  remSleepMinutes: number;
  sleepScore: number;
  medicines: string[];
}

export interface Relationship {
  name: string;
  tier: 'Inner Circle' | 'Tribe' | 'Extended';
  strength: number;
}

export interface FinancialPillar {
  label: string;
  value: number;
}

export interface FailureLog {
  id: string;
  event: string;
  lesson: string;
  action: string;
  timestamp: string;
}

export interface WarriorCodePrinciple {
  id: number;
  label: string;
  aligned: boolean;
}

export interface CommunityPost {
  id: string;
  author: string;
  rank: string;
  content: string;
  image?: string; 
  timestamp: string;
  reactions: {
    fire: number;
    muscle: number;
    trophy: number;
    salute: number;
  };
  userReacted?: string; 
}

// NEW: Daily Workflow Structure for JournalView
export interface DailyPriority {
  id: string;
  text: string;
  completed: boolean;
}

export interface DailyWorkflow {
  date: string; // YYYY-MM-DD
  mindsetLog: string;
  priorities: DailyPriority[];
  definitionOfDone: string;
  afternoonMomentum: string;
  afternoonPriority: string; // Added for Block 4
  eveningReflection: {
    win: string;
    drain: string;
    adjustment: string;
    gratitude: string;
  };
  shutdownChecklist: {
    strategicStop: boolean;
    brainDump: boolean;
    screensDimmed: boolean;
  };
  brainDumpText: string;
  xpAwarded: {
    log: boolean;
    priorities: number; // Count of completed priorities (max 3)
    doneDef: boolean;
    afternoon: boolean;
    afternoonPriority: boolean; // Added for Block 4
    evening: boolean; // All fields filled
    shutdown: boolean; // Checklist complete
  };
}

export type SubscriptionTier = 'Warrior' | 'Adept' | 'Legend';

export interface UserData {
  tier: SubscriptionTier; // New Tier
  dailyWorkflows: DailyWorkflow[]; // New Journal Data
  lifeWheel: LifeDomain[];
  visionText: string;
  goals: Goal[];
  habits: Habit[];
  challenges: Challenge[];
  journals: JournalEntry[];
  health: HealthMetrics;
  relationships: Relationship[];
  financialPillars: FinancialPillar[];
  financialData: FinancialData;
  debtLogic: string;
  failures: FailureLog[];
  warriorCode: WarriorCodePrinciple[];
  warriorCodePoints: number;
  lastAffirmationSeen?: string;
  communityPosts: CommunityPost[];
}

export type ViewType = 'Foundation' | 'Journal' | 'Resilience' | 'Ageless' | 'Wealth' | 'Tribe' | 'Legacy' | 'Community' | 'Support' | 'Codex' | 'Coach' | 'Subscription';
