
import React, { useState, useRef, useEffect } from 'react';
import { UserData } from '../types';
import { History, Shield, CheckCircle2, Circle, Send, Bot, Info, X } from 'lucide-react';
import { getLegacyCoachResponse } from '../services/gemini';

const LegacyView: React.FC<{ data: UserData; update: (u: Partial<UserData>) => void }> = ({ data, update }) => {
  const [showLesson, setShowLesson] = useState(false);
  const [activePrinciple, setActivePrinciple] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'bot', text: string}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  const toggleCode = async (id: number, label: string) => {
    const isCurrentlyAligned = data.warriorCode.find(p => p.id === id)?.aligned;
    const newCode = data.warriorCode.map(p => p.id === id ? { ...p, aligned: !p.aligned } : p);
    update({ warriorCode: newCode, warriorCodePoints: data.warriorCodePoints + (isCurrentlyAligned ? -10 : 10) });

    if (!isCurrentlyAligned) {
      setActivePrinciple(label);
      setIsTyping(true);
      setChatHistory([]); 
      const introContext = `I have just selected the principle: "${label}". Ask me how this specific principle aligns with my long-term vision of: "${data.visionText}".`;
      const response = await getLegacyCoachResponse(introContext, label, data.visionText, []);
      setChatHistory([{ role: 'bot', text: response || `How does "${label}" serve your vision, Warrior?` }]);
      setIsTyping(false);
    }
  };

  const handleLegacyChat = async () => {
    if (!chatInput.trim() || !activePrinciple) return;
    const userMsg = chatInput;
    const newHistory = [...chatHistory, { role: 'user' as const, text: userMsg }];
    setChatHistory(newHistory);
    setChatInput('');
    setIsTyping(true);
    const response = await getLegacyCoachResponse(userMsg, activePrinciple, data.visionText, newHistory);
    setChatHistory(prev => [...prev, { role: 'bot' as const, text: response || "System offline." }]);
    setIsTyping(false);
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-10 md:px-16 lg:px-24">
      
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-white/20 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">Growth Over Comfort</h3>
              <p className="text-base text-white/70 font-medium leading-relaxed italic">
                "Comfort is a slow death. Seek the crucible. Pain is the forge where your character is hammered into steel."
              </p>
           </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">The Legacy Path</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Code of Conduct & Long-Game</p>
      </header>

      <section className="glass-card p-6 md:p-12 shadow-glass relative overflow-hidden bg-[#595b61] transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-8 md:p-16 opacity-10 pointer-events-none">
          <Shield size={160} />
        </div>
        <div className="relative z-10">
          <h3 className="text-xs md:text-base font-black font-brand-header uppercase tracking-[0.3em] text-[#f78121] mb-8 md:mb-12">The Code</h3>
          <div className="grid grid-cols-1 gap-4 md:gap-5 mb-8">
            {data.warriorCode.map(p => (
              <button key={p.id} onClick={() => toggleCode(p.id, p.label)} className={`w-full flex items-center justify-between p-6 md:p-8 transition-all duration-500 group border rounded-xl ${p.aligned ? 'bg-[#f78121]/10 border-[#f78121] shadow-lg' : 'bg-black/20 border-white/10 hover:bg-white/5'}`}>
                <span className={`text-xs md:text-sm font-black uppercase tracking-widest ${p.aligned ? 'text-white' : 'text-white/50 group-hover:text-white'}`}>{p.label}</span>
                {p.aligned ? <CheckCircle2 size={20} className="text-[#f78121] md:w-6 md:h-6" /> : <Circle size={20} className="text-white/20 md:w-6 md:h-6" />}
              </button>
            ))}
          </div>

          {activePrinciple && (
            <div className="animate-in fade-in slide-in-from-top-4 duration-500 mt-10 border-t border-white/20 pt-10">
               <div className="bg-black/20 border border-white/10 rounded-3xl p-6 md:p-8 relative shadow-inner">
                 <div className="flex items-center space-x-3 mb-6">
                   <div className="p-2 bg-[#f78121]/10 rounded-full">
                     <Bot className="text-[#f78121] animate-pulse w-6 h-6" />
                   </div>
                   <div>
                     <h4 className="text-sm font-black uppercase tracking-[0.2em] text-white">Alignment Audit</h4>
                     <span className="text-xs text-white/50 font-bold uppercase tracking-widest">Principle: {activePrinciple}</span>
                   </div>
                 </div>

                 <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar mb-6">
                   {chatHistory.map((msg, idx) => (
                     <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-4 md:p-5 rounded-2xl text-xs md:text-sm font-medium leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#f78121] text-white rounded-tr-none' : 'bg-white/10 text-white rounded-tl-none border border-white/10'}`}>
                          {msg.text}
                        </div>
                     </div>
                   ))}
                   {isTyping && (
                     <div className="flex justify-start">
                       <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none flex space-x-1.5 items-center h-10">
                          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce" />
                          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-100" />
                          <div className="w-1.5 h-1.5 bg-white/50 rounded-full animate-bounce delay-200" />
                       </div>
                     </div>
                   )}
                   <div ref={chatEndRef} />
                 </div>

                 <div className="flex gap-3">
                   <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLegacyChat()} placeholder="Justify alignment..." className="flex-1 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-4 text-sm text-[#595b61] focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70" />
                   <button onClick={handleLegacyChat} disabled={isTyping || !chatInput} className="bg-[#f78121] text-white px-5 rounded-xl disabled:opacity-50 hover:bg-orange-600 transition-all shadow-lg active:scale-95"><Send size={20} /></button>
                 </div>
               </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default LegacyView;
