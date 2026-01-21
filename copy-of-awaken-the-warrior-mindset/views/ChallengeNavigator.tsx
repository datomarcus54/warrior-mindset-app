
import React, { useState } from 'react';
import { ChevronRight, Plus, Check, TrendingUp, Zap, Target, Info, X } from 'lucide-react';
import { UserData, Challenge } from '../types';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
}

const STAGES: Challenge['stage'][] = ['Acknowledge', 'Accept', 'Analyze', 'Act', 'Adapt'];

const ChallengeNavigator: React.FC<Props> = ({ data, update }) => {
  const [activeChallengeIndex, setActiveChallengeIndex] = useState<number | null>(null);
  const [newChallengeDesc, setNewChallengeDesc] = useState('');
  const [showLesson, setShowLesson] = useState(false);

  const addChallenge = () => {
    if (!newChallengeDesc.trim()) return;
    const newChallenge: Challenge = {
      id: Date.now().toString(),
      description: newChallengeDesc,
      stage: 'Acknowledge'
    };
    update({ 
      challenges: [...data.challenges, newChallenge],
      warriorCodePoints: data.warriorCodePoints + 10
    });
    setNewChallengeDesc('');
    setActiveChallengeIndex(data.challenges.length);
  };

  const advanceStage = (id: string) => {
    const newChallenges = data.challenges.map(c => {
      if (c.id === id) {
        const currentIdx = STAGES.indexOf(c.stage);
        if (currentIdx < STAGES.length - 1) {
          return { ...c, stage: STAGES[currentIdx + 1] };
        }
      }
      return c;
    });
    update({ challenges: newChallenges, warriorCodePoints: data.warriorCodePoints + 20 });
  };

  const activeChallenge = activeChallengeIndex !== null ? data.challenges[activeChallengeIndex] : null;

  return (
    <div className="space-y-10 md:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-[#45d0d0]/30 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">Resilience Over Fragility</h3>
              <p className="text-base text-white font-medium leading-relaxed italic">
                "Challenges are not insurmountable barriers but invaluable lessons that propel you toward mastery. Do not break; adapt and become stronger."
              </p>
           </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Challenge Navigator</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Breakthrough System</p>
      </header>

      <section className="glass-card p-6 md:p-10 shadow-glass">
        <div className="flex space-x-3 md:space-x-4 mb-8 md:mb-12">
          <input
            type="text"
            value={newChallengeDesc}
            onChange={(e) => setNewChallengeDesc(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addChallenge()}
            placeholder="Identify current obstacle..."
            className="flex-1 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-warrior px-4 md:px-8 py-4 md:py-5 text-base md:text-lg text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] placeholder:text-[#595b61]/70 transition-all"
          />
          <button onClick={addChallenge} className="bg-[#f78121] text-white p-4 md:p-5 rounded-warrior hover:bg-orange-600 transition-all active:scale-95 shadow-lg">
            <Plus size={24} className="md:w-7 md:h-7" />
          </button>
        </div>

        <div className="flex space-x-3 md:space-x-4 overflow-x-auto pb-4 md:pb-6 no-scrollbar">
          {data.challenges.map((c, idx) => (
            <button
              key={c.id}
              onClick={() => setActiveChallengeIndex(idx)}
              className={`flex-shrink-0 px-4 md:px-8 py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] rounded-warrior border transition-all duration-300 ${
                activeChallengeIndex === idx 
                  ? 'bg-[#f78121] text-white border-[#f78121] shadow-lg' 
                  : 'bg-black/20 text-white/50 border-white/10 hover:bg-white/10'
              }`}
            >
              {c.description.slice(0, 15)}{c.description.length > 15 ? '...' : ''}
            </button>
          ))}
        </div>
      </section>

      {activeChallenge && (
        <section className="glass-card p-6 md:p-12 shadow-glass animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-black/20 p-6 md:p-10 mb-10 md:mb-14 text-center relative overflow-hidden rounded-2xl border border-white/10">
            <div className="absolute top-0 left-0 w-1 md:w-2 h-full bg-[#f78121]" />
            <p className="text-lg md:text-2xl font-brand-quote italic font-bold text-white leading-relaxed">"{activeChallenge.description}"</p>
          </div>
          
          <div className="flex flex-col space-y-8 md:space-y-12">
            {STAGES.map((stage, idx) => {
              const currentStageIdx = STAGES.indexOf(activeChallenge.stage);
              const isActive = activeChallenge.stage === stage;
              const isPast = STAGES.indexOf(stage) < currentStageIdx;

              return (
                <div key={stage} className="relative flex items-center">
                  {idx < STAGES.length - 1 && (
                    <div className={`absolute left-4 md:left-6 top-10 md:top-14 w-[2px] h-8 md:h-12 ${isPast ? 'bg-[#f78121]' : 'bg-white/20'}`} />
                  )}
                  <div className={`z-10 w-8 h-8 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border transition-all duration-700 ${
                    isActive 
                      ? 'bg-[#f78121] border-[#f78121] scale-125 shadow-lg' 
                      : isPast 
                        ? 'bg-[#45d0d0] border-[#45d0d0]' 
                        : 'bg-white/10 border-white/20'
                  }`}>
                    {isPast ? <Check size={16} className="text-[#001b3d] md:w-5 md:h-5" /> : <span className={`text-xs md:text-sm font-black ${isActive ? 'text-white' : 'text-white/50'}`}>{idx + 1}</span>}
                  </div>
                  <div className={`ml-8 md:ml-12 transition-all duration-500 ${isActive ? 'translate-x-2 opacity-100 scale-105' : 'opacity-50'}`}>
                    <h4 className={`text-sm md:text-base font-black uppercase tracking-[0.3em] ${isActive ? 'text-[#f78121]' : 'text-white/60'}`}>{stage}</h4>
                    {isActive && (
                      <p className="text-xs md:text-sm text-white/80 mt-2 max-w-[400px] font-medium leading-relaxed">
                        {stage === 'Acknowledge' && "Define the obstacle clearly. What is the actual challenge?"}
                        {stage === 'Accept' && "Accept responsibility. This is the new baseline. How do we adapt?"}
                        {stage === 'Analyze' && "Observe neutrally. What is the data revealing?"}
                        {stage === 'Act' && "Execute the next step. Break the momentum of failure."}
                        {stage === 'Adapt' && "Integrate the lesson. How has this upgraded your system?"}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={() => advanceStage(activeChallenge.id)}
            disabled={activeChallenge.stage === 'Adapt'}
            className="w-full mt-12 md:mt-20 py-6 md:py-8 bg-[#f78121] text-white disabled:opacity-50 disabled:grayscale rounded-3xl font-black uppercase tracking-[0.2em] flex items-center justify-center space-x-3 md:space-x-4 transition-all active:scale-[0.98] shadow-2xl hover:bg-orange-600"
          >
            <span className="text-sm md:text-lg">{activeChallenge.stage === 'Adapt' ? 'Crisis Fully Integrated' : 'Achieve Breakthrough (+20 XP)'}</span>
            <ChevronRight size={20} className="md:w-7 md:h-7" />
          </button>
        </section>
      )}

      {!activeChallenge && data.challenges.length > 0 && (
         <div className="text-center py-16 md:py-24 opacity-40 italic">
           <Zap size={48} className="mx-auto mb-4 md:mb-6 text-white md:w-14 md:h-14" />
           <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-white">Select an Active Challenge</p>
         </div>
      )}
    </div>
  );
};

export default ChallengeNavigator;
