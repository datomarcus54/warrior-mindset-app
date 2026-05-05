import { GoogleGenAI, Type } from "@google/genai";
import { COACH_SYSTEM_PROMPT } from "../constants";
import { MealAnalysis } from "../types";

// HELPERS: Get the key safely from the browser environment
const getApiKey = () => {
  // 1. Try the Vite standard (Netlify/Local)
  const key = import.meta.env.VITE_GOOGLE_API_KEY;
  
  // 2. Fallback check
  if (!key) {
    console.error("API KEY MISSING: Check Netlify Environment Variables for 'VITE_GOOGLE_API_KEY'");
    throw new Error("API Key not found");
  }
  return key;
};

export const getCoachMarcusResponse = async (message: string) => {
  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Updated to the latest stable model
      contents: message,
      config: {
        systemInstruction: COACH_SYSTEM_PROMPT,
      },
    });
    return response.text;
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
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    
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

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contextPrompt,
      config: {
        systemInstruction: COACH_SYSTEM_PROMPT, 
      },
    });
    return response.text;
  } catch (error) {
    console.error("Legacy Coach error:", error);
    return "The connection is weak. Re-engage.";
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
