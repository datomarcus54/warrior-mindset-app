
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, Sparkles, Zap, ShieldAlert, X } from 'lucide-react';
import { UserData } from '../types';
import { STARTER_PROMPTS } from '../constants';
import { getCoachMarcusResponse } from '../services/gemini';

interface Props {
  data: UserData;
}

const CoachMarcus: React.FC<Props> = ({ data }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', text: string }[]>([
    { role: 'bot', text: "Warrior. I am Coach Marcus. I am here to extract your potential, not validate your feelings. What is the specific target you are striking today? Report." }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, isLoading]);

  const handleSend = async (msgText?: string) => {
    const textToSend = msgText || input;
    if (!textToSend.trim() || isLoading) return;

    const newMessages = [...messages, { role: 'user' as const, text: textToSend }];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    const response = await getCoachMarcusResponse(textToSend);
    setMessages(prev => [...prev, { role: 'bot' as const, text: response || "The transmission was jammed by fear. Try again, warrior." }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in zoom-in-95 duration-500 overflow-hidden text-white">
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
            <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase text-white leading-none tracking-wider">Coach Marcus</h2>
            <div className="flex items-center text-[10px] md:text-xs text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-1 md:mt-2">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-[#45d0d0] rounded-full mr-2 animate-pulse" />
              Active Protocol
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
            <div className={`max-w-[90%] p-4 md:p-6 rounded-[1.25rem] md:rounded-[1.75rem] text-sm md:text-base leading-relaxed shadow-lg ${
              m.role === 'user' 
              ? 'bg-[#f78121] text-white font-bold rounded-tr-none shadow-md' 
              : 'bg-[#001b3d] text-white rounded-tl-none font-medium border border-white/10'
            }`}>
              {m.text}
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
            <p className="text-[10px] md:text-xs text-white/50 font-black uppercase tracking-[0.3em] px-2 md:px-3">Mission Selection</p>
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
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Request Tactical Guidance..."
            className="w-full bg-[#eef1f1] border border-[#45d0d0]/30 rounded-2xl pl-4 md:pl-8 pr-14 md:pr-20 py-4 md:py-6 text-base md:text-lg text-[#595b61] focus:outline-none focus:border-[#f78121] shadow-inner transition-all placeholder:text-[#595b61]/70 font-medium"
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className={`absolute right-3 md:right-5 p-3 md:p-4 rounded-xl transition-all shadow-xl ${
              isLoading || !input.trim() ? 'text-slate-400' : 'text-white bg-[#f78121] hover:bg-orange-600 active:scale-90'
            }`}
          >
            <Send size={20} className="md:w-6 md:h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoachMarcus;
