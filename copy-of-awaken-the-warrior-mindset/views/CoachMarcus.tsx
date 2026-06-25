
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Zap, ShieldAlert, X, Mic } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { UserData } from '../types';
import { STARTER_PROMPTS } from '../constants';
import { getCoachMarcusResponse } from '../services/gemini';
import { saveConversation, loadMemorySummary } from '../services/coachConversationService';
import { loadCoachContextData } from '../services/coachContextService';

interface Props {
  data: UserData;
  userId: string;
}

// Gemini sometimes emits inline bullets like " * item" inside a paragraph.
// ReactMarkdown requires list items on their own line to render correctly.
const normalizeMarkdown = (text: string): string =>
  text.replace(/ \* /g, '\n* ');

const CoachMarcus: React.FC<Props> = ({ data, userId }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Warrior. I am Coach Marcus AI. I am here to extract your potential, not validate your feelings. What is on your mind today? Let's work through it." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [memorySummary, setMemorySummary] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  useEffect(() => {
    const loadHistory = async () => {
      const summary = await loadMemorySummary(userId);
      if (summary) setMemorySummary(summary);
    };
    if (userId) loadHistory();
  }, [userId]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice input is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onresult = (event: any) => {
      let fullTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      setTranscript(fullTranscript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const handleSend = async (msgText?: string) => {
    const textToSend = msgText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const coachData = await loadCoachContextData(userId, data);
    console.log('[CoachMarcus] mealLogs count:', coachData?.health?.mealLogs?.length, coachData?.health?.mealLogs);
    const response = await getCoachMarcusResponse(textToSend, coachData, memorySummary || undefined, coachData.name || data.name || 'Warrior');
    const botMessage = { role: 'bot' as const, text: response || "Something went wrong. Try again, warrior." };
    const savedMessages = [...newMessages, botMessage];
    setMessages(prev => [...prev, botMessage]);
    const sessionId = await saveConversation(userId, savedMessages);
    if (sessionId) {
      fetch('/.netlify/functions/summarise-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, messages: savedMessages, sessionId }),
      }).catch(() => {});
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden text-white">
      {/* Dynamic Background / Header Integration */}
      <div className="mb-6 md:mb-8 p-4 md:p-6 bg-[#595b61] border-2 border-[#f78121]/50 rounded-xl flex items-center justify-between shadow-lg relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f78121] to-[#e67e22] opacity-50" />
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-white/10 flex items-center justify-center border border-[#f78121] relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-[#f78121]/5 group-hover:bg-[#f78121]/10 transition-all" />
            <Bot size={28} className="text-[#f78121] relative z-10 md:w-9 md:h-9" />
            <div className="absolute -top-1 -right-1">
              <Zap size={16} className="text-[#45d0d0] fill-[#45d0d0] animate-pulse md:w-5 md:h-5" />
            </div>
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase text-white leading-none tracking-wider">Coach Marcus AI</h2>
            <div className="flex items-center text-[10px] md:text-xs text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-1 md:mt-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#45d0d0] rounded-full mr-2 animate-pulse" />
              Active Session
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 md:space-y-6 pr-2 custom-scrollbar px-1 mb-4 md:mb-6"
      >
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
            <div className={`${m.role === 'user' ? 'max-w-[90%]' : 'max-w-[95%]'} p-4 md:p-6 rounded-[1.25rem] md:rounded-[1.75rem] text-sm md:text-base leading-relaxed shadow-lg ${
              m.role === 'user'
              ? 'bg-[#f78121] text-white font-bold rounded-tr-none shadow-md'
              : 'bg-[#001b3d] text-white rounded-tl-none font-medium border border-white/10'
            }`}>
              {m.role === 'user' ? m.text : (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                    ul: ({ children }) => <ul className="list-disc list-inside space-y-3 mb-4">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside space-y-3 mb-4">{children}</ol>,
                    li: ({ children }) => <li className="leading-relaxed mb-2">{children}</li>,
                    hr: () => <hr className="border-white/20 my-3" />,
                  }}
                >
                  {normalizeMarkdown(m.text)}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-[#001b3d] border border-white/10 p-4 md:p-6 rounded-3xl flex items-center space-x-2">
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#f78121] rounded-full animate-bounce" />
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#f78121] rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#f78121] rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input & Starters */}
      <div className="space-y-3 md:space-y-5 pt-3 md:pt-4 border-t border-[#f78121]/30">
        {messages.length === 1 && (
          <div className="flex flex-col space-y-2 md:space-y-3">
            <p className="text-[10px] md:text-xs text-white/50 font-black uppercase tracking-[0.3em] px-2 md:px-3">Quick Start</p>
            <div className="flex overflow-x-auto space-x-3 md:space-x-4 pb-2 md:pb-4 px-1 md:px-2 no-scrollbar">
              {STARTER_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(p)}
                  className="flex-shrink-0 text-[10px] md:text-xs bg-[#595b61] border border-white/10 hover:bg-[#f78121] hover:text-white text-white/70 px-4 py-3 md:px-6 md:py-5 rounded-2xl max-w-[180px] md:max-w-[220px] text-left leading-tight transition-all active:scale-95 font-black uppercase tracking-widest shadow-sm"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="relative flex items-center p-1 md:p-2 group">
          {isListening ? (
            <div className="w-full bg-[#001b3d] border border-[#f78121]/50 rounded-2xl px-6 py-5 flex items-center justify-between pr-20 md:pr-24">
              <div className="flex items-end gap-1.5 h-7">
                <div className="w-1 rounded-full bg-[#f78121] animate-pulse h-3 [animation-delay:0s]" />
                <div className="w-1 rounded-full bg-[#f78121] animate-pulse h-5 [animation-delay:0.1s]" />
                <div className="w-1 rounded-full bg-[#f78121] animate-pulse h-7 [animation-delay:0.2s]" />
                <div className="w-1 rounded-full bg-[#f78121] animate-pulse h-4 [animation-delay:0.3s]" />
                <div className="w-1 rounded-full bg-[#f78121] animate-pulse h-6 [animation-delay:0.4s]" />
              </div>
              <span className="text-white/70 text-sm font-medium">Listening...</span>
            </div>
          ) : transcript ? (
            <div className="w-full pr-20 md:pr-24">
              <div className="w-full bg-[#001b3d] border border-[#45d0d0]/30 rounded-2xl px-6 py-4 text-white text-sm font-medium mb-3">
                {transcript}
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTranscript('')}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-bold text-sm transition-all hover:bg-white/20 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => { handleSend(transcript); setTranscript(''); }}
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-[#f78121] text-white font-bold text-sm transition-all hover:bg-orange-600 active:scale-95 disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          ) : (
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask your coach..."
              className="w-full bg-[#eef1f1] border border-[#45d0d0]/30 rounded-2xl pl-4 md:pl-8 pr-28 md:pr-36 py-4 md:py-6 text-base md:text-lg text-[#595b61] focus:outline-none focus:border-[#f78121] shadow-inner transition-all placeholder:text-[#595b61]/70 font-medium"
            />
          )}
          <div className="absolute right-3 md:right-5 flex items-center space-x-2 md:space-x-3">
            <button
              onClick={toggleListening}
              aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
              className={`p-3 md:p-4 rounded-xl transition-all shadow-xl ${
                isListening
                  ? 'text-white bg-red-500 animate-pulse'
                  : 'text-[#f78121] bg-[#001b3d] hover:bg-[#001b3d]/80 active:scale-90'
              }`}
            >
              <Mic size={20} className="md:w-6 md:h-6" />
            </button>
            {!isListening && !transcript && (
              <button 
                onClick={() => handleSend()}
                disabled={isLoading || !input.trim()}
                className={`p-3 md:p-4 rounded-xl transition-all shadow-xl ${
                  isLoading || !input.trim() ? 'text-slate-400' : 'text-white bg-[#f78121] hover:bg-orange-600 active:scale-90'
                }`}
              >
                <Send size={20} className="md:w-6 md:h-6" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachMarcus;
