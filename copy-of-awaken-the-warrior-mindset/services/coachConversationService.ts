import { supabase } from './supabase';
export interface ChatMessage {
  role: 'user' | 'bot';
  text: string;
}
const TABLE = 'coach_conversations';
export async function saveConversation(userId: string, messages: ChatMessage[]): Promise<string | null> {
  if (!userId || messages.length <= 1) return null;
  const { data, error } = await supabase.from(TABLE).insert({
    user_id: userId,
    messages: messages,
    session_date: new Date().toISOString()
  }).select('id').single();
  if (error || !data) return null;
  return data.id;
}
export async function loadRecentConversations(userId: string): Promise<ChatMessage[][]> {
  if (!userId) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select('messages')
    .eq('user_id', userId)
    .order('session_date', { ascending: false })
    .limit(5);
  if (error || !data) return [];
  return data.map((row: any) => row.messages);
}
export async function loadMemorySummary(userId: string): Promise<string | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from(TABLE)
    .select('memory_summary')
    .eq('user_id', userId)
    .not('memory_summary', 'is', null)
    .order('session_date', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error || !data?.memory_summary) return null;
  return data.memory_summary;
}
