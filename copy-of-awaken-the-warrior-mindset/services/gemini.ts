import { COACH_SYSTEM_PROMPT } from "../constants";
import { MealAnalysis, UserData } from "../types";

const bmiCategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

const sumActual = (items: Array<{ actual: number }>) =>
  items.reduce((acc, i) => acc + (i.actual || 0), 0);
const sumValue = (items: Array<{ value: number }>) =>
  items.reduce((acc, i) => acc + (i.value || 0), 0);

const section = (heading: string, items: string[], out: string[]) => {
  if (!items.length) return;
  out.push(heading);
  items.forEach(l => out.push(`  - ${l}`));
};

const buildUserContext = (data: UserData): string => {
  const lines: string[] = [];
  const h = data.health;

  // Body composition
  const body: string[] = [];
  if (h.age) body.push(`Age: ${h.age}`);
  if (h.heightCm) body.push(`Height: ${h.heightCm} cm`);
  if (h.weightKg) {
    body.push(`Weight: ${h.weightKg} kg`);
    if (h.heightCm) {
      const bmi = h.weightKg / Math.pow(h.heightCm / 100, 2);
      body.push(`BMI: ${bmi.toFixed(1)} (${bmiCategory(bmi)})`);
    }
    if (h.bodyFatPercent) {
      const fatMass = h.weightKg * (h.bodyFatPercent / 100);
      body.push(`Body Fat: ${h.bodyFatPercent}%`);
      body.push(`Fat Mass: ${fatMass.toFixed(1)} kg`);
      body.push(`Lean Mass: ${(h.weightKg - fatMass).toFixed(1)} kg`);
    }
  }
  section('Body Composition:', body, lines);

  // Sleep
  const sleep: string[] = [];
  if (h.sleepScore) sleep.push(`Sleep Score: ${h.sleepScore}/100`);
  const bedMins = (h.timeInBedHours || 0) * 60 + (h.timeInBedMinutes || 0);
  if (bedMins) sleep.push(`Time in Bed: ${(bedMins / 60).toFixed(1)} hrs`);
  const asleepMins = (h.timeAsleepHours || 0) * 60 + (h.timeAsleepMinutes || 0);
  if (asleepMins) sleep.push(`Actual Sleep: ${(asleepMins / 60).toFixed(1)} hrs`);
  section('Sleep (latest logged):', sleep, lines);

  // Life Circle scores — omit any at 0
  const lifeScores = data.lifeWheel.filter(d => d.value > 0);
  if (lifeScores.length) {
    lines.push('Life Circle Scores (1–10):');
    lifeScores.forEach(d => lines.push(`  - ${d.name}: ${d.value}/10`));
  }

  // Journal — latest daily workflow + streak
  const journal: string[] = [];
  if (data.journalStreak) journal.push(`Streak: ${data.journalStreak} days`);
  const latestWf = [...data.dailyWorkflows]
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  if (latestWf) {
    if (latestWf.mindsetLog?.trim())
      journal.push(`Morning Intention (${latestWf.date}): ${latestWf.mindsetLog.trim()}`);
    const er = latestWf.eveningReflection;
    if (er?.win?.trim())        journal.push(`Evening Win: ${er.win.trim()}`);
    if (er?.drain?.trim())      journal.push(`Energy Drain: ${er.drain.trim()}`);
    if (er?.adjustment?.trim()) journal.push(`Tomorrow's Adjustment: ${er.adjustment.trim()}`);
  }
  section('Journal (latest):', journal, lines);

  // Wealth — computed from financial data
  const fd = data.financialData;
  const totalAssets = sumValue(fd.assets.liquid) + sumValue(fd.assets.fixed);
  const totalLiabilities = sumValue(fd.liabilities.shortTerm) + sumValue(fd.liabilities.longTerm);
  const netWorth = totalAssets - totalLiabilities;
  const monthlyIncome = sumActual(fd.income);
  const totalExpenses = sumActual(fd.expenses.fixed) + sumActual(fd.expenses.mandatory) + sumActual(fd.expenses.variable);
  const netCashFlow = monthlyIncome - totalExpenses;
  const wealth: string[] = [];
  if (totalAssets)      wealth.push(`Total Assets: RM ${totalAssets.toLocaleString()}`);
  if (totalLiabilities) wealth.push(`Total Liabilities: RM ${totalLiabilities.toLocaleString()}`);
  if (totalAssets || totalLiabilities) wealth.push(`Net Worth: RM ${netWorth.toLocaleString()}`);
  if (monthlyIncome)    wealth.push(`Monthly Income: RM ${monthlyIncome.toLocaleString()}`);
  if (netCashFlow !== 0) wealth.push(`Net Cash Flow: RM ${netCashFlow.toLocaleString()} / mo`);
  section('Wealth:', wealth, lines);

  // Resilience — latest After Action Report
  const latestAAR = [...data.failures]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  if (latestAAR) {
    const aar: string[] = [];
    if (latestAAR.event?.trim())  aar.push(`What happened: ${latestAAR.event.trim()}`);
    if (latestAAR.lesson?.trim()) aar.push(`What was learned: ${latestAAR.lesson.trim()}`);
    if (latestAAR.action?.trim()) aar.push(`What will be done differently: ${latestAAR.action.trim()}`);
    section('Resilience (latest AAR):', aar, lines);
  }

  // Active goals with milestone progress
  const activeGoals = data.goals.filter(g => !g.completed);
  if (activeGoals.length) {
    lines.push('Active Goals:');
    activeGoals.forEach(g => {
      const pct = g.milestones.length
        ? Math.round(g.milestones.reduce((acc, m) => acc + m.progress, 0) / g.milestones.length)
        : null;
      const prog = pct !== null ? ` (${pct}% complete)` : '';
      lines.push(`  - [${g.category}] ${g.text}${prog}`);
    });
  }

  // Habit Laboratory — active habits and streaks
  if (data.habits.length) {
    lines.push('Habits:');
    data.habits.forEach(habit => {
      const streak = habit.streak ? ` — ${habit.streak} day streak` : ' — no current streak';
      lines.push(`  - ${habit.name}${streak}`);
    });
  }

  if (!lines.length) return '';

  return (
    '\n\n---\n' +
    'USER PROFILE (injected by app — use naturally, never reference as "the database" or "your record"):\n' +
    lines.join('\n') +
    '\n---'
  );
};

const callChatFunction = async (message: string, systemPrompt: string): Promise<string> => {
  const res = await fetch('/.netlify/functions/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, systemPrompt }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(err.error ?? 'Serverless function error');
  }
  const data = await res.json() as { response: string };
  return data.response ?? '';
};

export const getCoachMarcusResponse = async (message: string, data: UserData, memorySummary?: string) => {
  try {
    const context = buildUserContext(data);
    let systemPrompt = context ? COACH_SYSTEM_PROMPT + context : COACH_SYSTEM_PROMPT;
    if (memorySummary) {
      systemPrompt += `\n\nMemory from previous sessions:\n${memorySummary}`;
    }
    return await callChatFunction(message, systemPrompt);
  } catch (error) {
    console.error("Coach Marcus error:", error);
    return "I'm having trouble connecting right now. Please try again in a moment.";
  }
};

export const getLegacyCoachResponse = async (
  userMessage: string,
  principle: string,
  vision: string,
  history: {role: string, text: string}[]
) => {
  try {
    const contextPrompt = `
    CONTEXT:
    The user is in the "Legacy Path" module and has activated the Warrior Principle: "${principle}".
    Their defined Long-Term Vision is: "${vision || "Undefined"}".

    YOUR MISSION (Coach Marcus):
    Conduct a "Legacy Alignment Check" to ensure this principle actually serves their vision.

    STRICT BEHAVIORAL PROTOCOLS:
    1. **NEVER DISAGREE**: Do not argue or tell the user they are wrong. Allow them to express their belief.
    2. **SOCRATIC METHOD**: Ask *one* open-ended question that prompts the user to evaluate *why* this principle is necessary for their specific vision.
    3. **CLARITY CHECK**:
       - If the user's answer is vague, ask them to go deeper (gently).
       - If the user's answer demonstrates clarity and alignment, DO NOT ask another question. Instead, validate them and leave them with a profound, philosophical thought or "Warrior Koan" related to that principle for them to process in their own time.
    4. **TONE**: Stoic, supportive, deep, and brief. You are a mentor, not a debater.

    HISTORY:
    ${history.map(h => `${h.role}: ${h.text}`).join('\n')}

    CURRENT USER INPUT:
    ${userMessage}
    `;

    return await callChatFunction(contextPrompt, COACH_SYSTEM_PROMPT);
  } catch (error) {
    console.error("Legacy Coach error:", error);
    return "This connection needs attention.";
  }
};

export const estimateMealFromDescription = async (description: string): Promise<Partial<MealAnalysis> | null> => {
  try {
    const prompt = `Estimate the nutritional content of this meal: "${description}". Return ONLY a valid JSON object with exactly these fields (all values must be numbers): {"calories": number, "protein": number, "carbs": number, "fats": number, "description": "${description}"}. No markdown, no explanation, just the JSON object.`;
    const raw = await callChatFunction(prompt, 'You are a nutrition expert. Always respond with a single valid JSON object only — no markdown, no code fences, no extra text.');
    const clean = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(clean);
  } catch (error) {
    console.error('Meal estimation error:', error);
    return null;
  }
};

export const analyzeMealImage = async (base64Data: string, mimeType?: string): Promise<Partial<MealAnalysis> | null> => {
  try {
    const res = await fetch('/.netlify/functions/analyze-meal-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ base64Data, mimeType: mimeType || 'image/jpeg' }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.result || null;
  } catch (error) {
    console.error('Meal Analysis error:', error);
    return null;
  }
};
