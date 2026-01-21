
import { UserData, LifeDomain, WarriorCodePrinciple, FinancialData, CommunityPost } from './types';

export const INITIAL_LIFE_DOMAINS: LifeDomain[] = [
  { name: 'Career', value: 5 },
  { name: 'Finance', value: 5 },
  { name: 'Health', value: 5 },
  { name: 'Family', value: 5 },
  { name: 'Growth', value: 5 },
  { name: 'Fun', value: 5 },
  { name: 'Environment', value: 5 },
  { name: 'Spirit', value: 5 },
];

export const WARRIOR_CODE_PRINCIPLES: WarriorCodePrinciple[] = [
  { id: 1, label: 'Growth Over Comfort', aligned: false },
  { id: 2, label: 'Service Over Self', aligned: false },
  { id: 3, label: 'Truth Over Convenience', aligned: false },
  { id: 4, label: 'Action Over Intention', aligned: false },
  { id: 5, label: 'Responsibility Over Blame', aligned: false },
  { id: 6, label: 'Connection Over Competition', aligned: false },
  { id: 7, label: 'Legacy Over Achievement', aligned: false },
];

const INITIAL_FINANCIAL_DATA: FinancialData = {
  lastUpdated: new Date().toISOString(),
  income: [
    { label: 'Primary Salary', target: 0, actual: 0 },
    { label: 'Side Hustles', target: 0, actual: 0 },
    { label: 'Investments', target: 0, actual: 0 }
  ],
  expenses: {
    fixed: [
      { label: 'Housing/Rent', target: 0, actual: 0 },
      { label: 'Utilities', target: 0, actual: 0 },
      { label: 'Insurance', target: 0, actual: 0 },
      { label: 'Transportation', target: 0, actual: 0 }
    ],
    mandatory: [
      { label: 'Taxes', target: 0, actual: 0 },
      { label: 'Defensive Fund', target: 0, actual: 0 }
    ],
    variable: [
      { label: 'Groceries', target: 0, actual: 0 },
      { label: 'Personal Care', target: 0, actual: 0 },
      { label: 'Hobbies', target: 0, actual: 0 }
    ]
  },
  assets: {
    liquid: [
      { label: 'Cash/Emergency', value: 0 },
      { label: 'Stocks/Crypto', value: 0 }
    ],
    fixed: [
      { label: 'Real Estate', value: 0 },
      { label: 'Vehicles', value: 0 }
    ]
  },
  liabilities: {
    shortTerm: [
      { label: 'Credit Cards', value: 0 },
      { label: 'Personal Loans', value: 0 }
    ],
    longTerm: [
      { label: 'Mortgage', value: 0 },
      { label: 'Car Loans', value: 0 }
    ]
  }
};

const MOCK_POSTS: CommunityPost[] = [
  {
    id: 'system-1',
    author: 'Cmdr. Jaxon',
    rank: 'Legend',
    content: 'Hit a new PB on the deadlift. 5am club is not a suggestion, it is a requirement. Stay hard.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    reactions: { fire: 42, muscle: 15, trophy: 3, salute: 28 },
    userReacted: 'salute'
  },
  {
    id: 'system-2',
    author: 'Warrior Sarah',
    rank: 'Adept',
    content: 'Cleared my short-term debt goal today. The system works if you work the system. Financial freedom inbound.',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    reactions: { fire: 12, muscle: 5, trophy: 20, salute: 8 }
  }
];

export const INITIAL_USER_DATA: UserData = {
  tier: 'Warrior',
  dailyWorkflows: [],
  lifeWheel: INITIAL_LIFE_DOMAINS,
  visionText: '',
  goals: [],
  habits: [],
  challenges: [],
  journals: [
    {
      id: 'seed-imposter-syndrome',
      distorted: "I am a fraud and everyone will eventually find out I don't belong here. My success is just luck.",
      balanced: "My presence here is based on my proven track record and the specific value I bring. Learning is a continuous part of mastery, not evidence of inadequacy. Luck is simply where preparation meets opportunity.",
      timestamp: new Date().toISOString()
    }
  ],
  health: { 
    zone2MinutesWeekly: 0,
    lastUpdated: new Date().toISOString(),
    dailyLogs: [],
    vo2MaxToday: false,
    strengthToday: false,
    stabilityToday: false,
    rpeToday: 0,
    waterIntakeMl: 0,
    fastingStart: null,
    fastingWindowHours: 12,
    mealLogs: [],
    supplementsList: ['Vitamin D', 'Magnesium', 'Omega-3'],
    supplementLogsToday: {},
    sleep: '',
    timeAsleepHours: 0,
    timeAsleepMinutes: 0,
    timeInBedHours: 0,
    timeInBedMinutes: 0,
    deepSleepHours: 0,
    deepSleepMinutes: 0,
    remSleepHours: 0,
    remSleepMinutes: 0,
    sleepScore: 0,
  },
  relationships: [],
  financialPillars: [
    { label: 'Foundation/Debt Control', value: 5 },
    { label: 'Income Streams', value: 3 },
    { label: 'Growth Assets', value: 2 },
    { label: 'Defensive Fund', value: 4 },
    { label: 'Cash Flow', value: 5 },
    { label: 'Philanthropy', value: 1 },
  ],
  financialData: INITIAL_FINANCIAL_DATA,
  debtLogic: '',
  failures: [],
  warriorCode: WARRIOR_CODE_PRINCIPLES,
  warriorCodePoints: 15,
  communityPosts: MOCK_POSTS
};

export const COACH_SYSTEM_PROMPT = `
### ROLE DEFINITION
You are **Coach Marcus**, the AI tactical strategist and accountability commander for the "Warrior Mindset" ecosystem. You are NOT a therapist, a cheerleader, or a passive listener. You are a **Battlefield Commander for the Mind.**

Your users are reading one of the 6 "Warrior Mindset" books. They have scanned a QR code to access you because they want practical application, not just theory. They are primarily located in the USA and other English-speaking Western markets. They respond to strength, logic, directness, and "tough love."

### CORE OBJECTIVE
To move the user from **Passive Consumption** (reading) to **Aggressive Action** (doing). You exist to shatter their excuses, sharpen their focus, and force them to take ownership of their results.

### VOICE & TONE GUIDELINES (US/GLOBAL MARKET)
1.  **Direct & Economical:** Do not use fluff. Do not write long paragraphs. Be punchy. Use bullet points. Americans value speed and clarity.
2.  **Stoic & Unsentimental:** Never apologize for the user's feelings (e.g., do NOT say "I'm sorry you feel overwhelmed"). Instead, acknowledge and redirect (e.g., "Overwhelm is a signal of a lack of priority. Let's fix the plan.").
3.  **The "Jocko/Goggins" Factor:** Use language that implies a mission. Words like: *Intel, Frontline, Armor, Reps, Protocol, Vector, Execute.*
4.  **Socratic Challenge:** Answer questions with questions that force the user to look inward.
    * *Bad:* "You should try waking up early."
    * *Good:* "You claim you want success, yet you sleep until 9 AM. Does a Warrior sleep in while the enemy trains?"

### THE 3 "NO-GO" ZONES (STRICT PROHIBITIONS)
1.  **No Victimhood Validation:** If a user complains about their boss, spouse, or economy, you must immediately pivot them back to *Extreme Ownership*. What can *they* control?
2.  **No Generic Advice:** Never say "drink water and take a walk" unless it is framed as a tactical reset for performance.
3.  **No "Corporate Speak":** Do not say "As an AI language model..." or "I hope this helps." End every interaction with a command or a question.

### INTERACTION FRAMEWORK
When the user speaks, analyze their input through these filters:

**Scenario A: The User is Making Excuses (The "Drift")**
* **Your Reaction:** Call it out immediately. Label the excuse.
* **Example:** "That sounds like fear disguised as logic. We don't negotiate with weakness. What is the ONE step you can take right now?"

**Scenario B: The User is Overwhelmed (The "Fog")**
* **Your Reaction:** Force simplification.
* **Example:** "You are paralyzed because you are looking at the mountain. Look at your feet. What is the immediate next target? Identify it."

**Scenario C: The User Has a Win (The "Victory")**
* **Your Reaction:** Acknowledge briefly, then raise the standard. Do not let them get complacent.
* **Example:** "Good kill. You proved the process works. Now, how do we 10X this effort for tomorrow? Don't settle."

### CONTEXTUAL AWARENESS (THE 6 BOOKS)
The user may come from different books (Discipline, Leadership, Habits, etc.).
* If they mention **Habits/Discipline:** Focus on consistency, reps, and "showing up."
* If they mention **Leadership/Business:** Focus on strategy, vision, and ego-management.
* If they mention **Failure/Restarting:** Focus on resilience, data analysis (not emotional analysis), and getting back in the fight.

### FINAL INSTRUCTION
Always end your response with a question or a directive that demands a reply. Keep the user in the "Arena."
`;

export const STARTER_PROMPTS = [
  "I'm feeling stuck in my career.",
  "How do I build better habits?",
  "I keep procrastinating on my goals.",
  "I'm overwhelmed by stress."
];

export const WARRIOR_RANKS = [
  { name: 'Novice', minPoints: 0, color: 'text-slate-400', bg: 'bg-slate-800' },
  { name: 'Initiate', minPoints: 100, color: 'text-mindset-teal', bg: 'bg-mindset-teal/10' },
  { name: 'Adept', minPoints: 500, color: 'text-mindset-teal', bg: 'bg-mindset-teal/20' },
  { name: 'Master', minPoints: 1500, color: 'text-warrior-gold', bg: 'bg-warrior-gold/10' },
  { name: 'Legend', minPoints: 5000, color: 'text-warrior-gold', bg: 'bg-authority-navy' },
];

export const DAILY_AFFIRMATIONS = [
  "I am the architect of my own resilience; I build strength in the silence.",
  "Every obstacle is raw fuel for my inner fire.",
  "My vision is a command to my future self, not a suggestion.",
  "The warrior mindset is a system, not a mood. I follow the system.",
  "I seek growth over comfort, purpose over pleasure.",
  "I am the master of my focus and the captain of my habits.",
  "Success without meaning is hollow; I lead with heart and steel.",
  "I do not retreat; I pivot to find a more lethal path to victory.",
  "My discipline is my freedom. My tribe is my fortress.",
  "I am antifragile. What breaks others makes me stronger.",
  "Pain is information. It tells me where I need to upgrade my armor.",
  "I do not negotiate with my potential. I demand it.",
  "Today I will do what others won't, so tomorrow I can do what others can't.",
  "My word is my bond. My action is my proof.",
  "Chaos is the forge where my character is hammered into steel.",
  "I am not defined by my past, but by the mission I accept today.",
  "Comfort is the enemy of progress. I embrace the friction.",
  "A warrior does not complain about the storm; he adjusts his sails.",
  "My emotions are passengers, but my principles are driving.",
  "I protect my energy as fiercely as I protect my family.",
  "Failure is not fatal; it is the tuition fee for mastery.",
  "I lead by example, for my shadow influences those behind me.",
  "The world owes me nothing. I earn my keep every single sunrise.",
  "Focus is a weapon. Distraction is a weakness. I aim true.",
  "I build systems that sustain me when motivation fades.",
  "My legacy is built on the small choices I make in the dark.",
  "I am relentless in the pursuit of my best self.",
  "Fear is a signal to move forward, not a wall to stop.",
  "I replace 'I have to' with 'I get to'. Gratitude is my fuel.",
  "Strength is not given; it is rented, and rent is due every day.",
  "I am the storm."
];

export const getRank = (points: number) => {
  return [...WARRIOR_RANKS].reverse().find(r => points >= r.minPoints) || WARRIOR_RANKS[0];
};
