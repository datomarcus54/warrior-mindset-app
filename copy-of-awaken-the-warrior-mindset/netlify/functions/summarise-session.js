const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createClient } = require('@supabase/supabase-js');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { userId, messages, sessionId } = JSON.parse(event.body);
  if (!userId || !messages || !sessionId) return { statusCode: 400, body: 'Missing fields' };

  const transcript = messages.map(m => `${m.role === 'user' ? 'User' : 'Coach Marcus'}: ${m.text}`).join('\n');

  const prompt = `You are summarising a coaching session. Write a brief 3-5 sentence memory summary of this conversation. Focus on: the user's main goals, struggles, commitments made, and any important context Coach Marcus should remember next time. Be specific, not generic.\n\nSession transcript:\n${transcript}`;

  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  const result = await model.generateContent(prompt);
  const summary = result.response.text();

  await supabase.from('coach_conversations').update({ memory_summary: summary }).eq('id', sessionId);

  return { statusCode: 200, body: JSON.stringify({ summary }) };
};
