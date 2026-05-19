import { GoogleGenAI, Type } from "@google/genai";
import { COACH_SYSTEM_PROMPT } from "../constants";
import { MealAnalysis, UserData } from "../types";

const bmiCategory = (bmi: number): string => {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
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
  if (body.length) {
    lines.push('Body Composition:');
    body.forEach(l => lines.push(`  - ${l}`));
  }

  // Sleep
  const sleep: string[] = [];
  if (h.sleepScore) sleep.push(`Sleep Score: ${h.sleepScore}/100`);
  const bedMins = (h.timeInBedHours || 0) * 60 + (h.timeInBedMinutes || 0);
  if (bedMins) sleep.push(`Time in Bed: ${(bedMins / 60).toFixed(1)} hrs`);
  const asleepMins = (h.timeAsleepHours || 0) * 60 + (h.timeAsleepMinutes || 0);
  if (asleepMins) sleep.push(`Actual Sleep: ${(asleepMins / 60).toFixed(1)} hrs`);
  if (sleep.length) {
    lines.push('Sleep (latest logged):');
    sleep.forEach(l => lines.push(`  - ${l}`));
  }

  // Life Circle scores — omit any at 0
  const lifeScores = data.lifeWheel.filter(d => d.value > 0);
  if (lifeScores.length) {
    lines.push('Life Circle Scores (1–10):');
    lifeScores.forEach(d => lines.push(`  - ${d.name}: ${d.value}/10`));
  }

  if (!lines.length) return '';

  return (
    '\n\n---\n' +
    'USER PROFILE (injected by app — use naturally, never reference as "the database" or "your record"):\n' +
    lines.join('\n') +
    '\n---'
  );
};

// Used only by analyzeMealImage — chat functions route through the serverless function instead
const getApiKey = () => {
  const key = import.meta.env.VITE_GEMINI_API_KEY;
  if (!key) {
    console.error("API KEY MISSING: Check Netlify Environment Variables for 'VITE_GEMINI_API_KEY'");
    throw new Error("API Key not found");
  }
  return key;
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

export const getCoachMarcusResponse = async (message: string, data: UserData) => {
  try {
    const context = buildUserContext(data);
    const systemPrompt = context ? COACH_SYSTEM_PROMPT + context : COACH_SYSTEM_PROMPT;
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
    Conduct a "Legacy Alignment Audit" to ensure this principle actually serves their vision.

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
    return "The connection is weak. Re-engage.";
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

export const analyzeMealImage = async (base64Data: string): Promise<Partial<MealAnalysis> | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const imagePart = {
      inlineData: {
        mimeType: 'image/jpeg',
        data: base64Data,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          parts: [
            imagePart,
            { text: "Analyze this meal photo. Provide estimated calories, protein (g), carbs (g), and fats (g). Respond in JSON format only." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
            description: { type: Type.STRING }
          },
          required: ["calories", "protein", "carbs", "fats", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Meal Analysis error:", error);
    return null;
  }
};
