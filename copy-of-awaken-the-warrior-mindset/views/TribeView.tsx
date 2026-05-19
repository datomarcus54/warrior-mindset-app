
import React, { useState } from 'react';
import { UserData, Relationship } from '../types';
import { Shield, UserPlus, Info, X, Lock } from 'lucide-react';

const TribeView: React.FC<{ data: UserData; update: (u: Partial<UserData>) => void; isGuest: boolean; onRestricted: () => void; isMobileMode: boolean; }> = ({ data, update, isMobileMode }) => {
  const [name, setName] = useState('');
  const [tier, setTier] = useState<Relationship['tier']>('Inner Circle');
  const [showLesson, setShowLesson] = useState(false);

  const addRelationship = () => {
    if (!name.trim()) return;
    const newRel: Relationship = { name, tier, strength: 5 };
    update({ 
      relationships: [...data.relationships, newRel],
      warriorCodePoints: data.warriorCodePoints + 10
    });
    setName('');
  };

  const isUnlocked = data.tier === 'Legend';

  return (
    <div className="space-y-12 md:space-y-16 pb-20 relative">
      {!isUnlocked && (
        <div className="absolute inset-0 z-50 bg-[#0A3762]/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center h-[100vh]">
            <Lock size={48} className="text-[#f78121] mb-4" />
            <h3 className="text-2xl font-black uppercase text-white mb-2">Members Only</h3>
            <p className="text-[#45d0d0] mb-8 max-w-sm">Upgrade to Legend Class to access Tribe Architecture.</p>
            {!isMobileMode && <button onClick={() => update({ tier: 'Legend' })} className="px-8 py-3 bg-[#f78121] text-white font-black uppercase tracking-widest rounded-lg hover:bg-white hover:text-[#0A3762] transition-all">Unlock Access</button>}
        </div>
      )}
      
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-[#white]/20 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">Strong Relationships</h3>
              <p className="text-base text-white/70 font-medium leading-relaxed italic">
                "You become the average of the five people you spend the most time with. Choose them carefully. Audit your circle."
              </p>
           </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Your Circle</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">People Around You</p>
      </header>

      {/* Main Tribe Card */}
      <section 
        className="rounded-3xl p-6 md:p-12 shadow-2xl border-2 border-[#f78121]/50 bg-[#595b61] transition-all duration-300 ease-in-out hover:-translate-y-1"
      >
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 rounded-full bg-[#f78121]/10 border border-[#f78121]/30">
              <Shield size={24} color="#f78121" />
           </div>
           <div>
              <h3 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-wider text-white">Your Tribe</h3>
              <p className="text-xs font-bold text-[#f78121] uppercase tracking-[0.2em]">Active Members</p>
           </div>
        </div>

        <h3 className="text-xs md:text-base font-black font-brand-header uppercase tracking-[0.3em] text-[#f78121] mb-6 md:mb-10">Map Your Circle</h3>
        
        <div className="flex flex-col space-y-6 md:space-y-8">
          <input 
            value={name} onChange={(e) => setName(e.target.value)}
            placeholder="Add a person..."
            className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-warrior px-6 md:px-8 py-4 md:py-6 text-base md:text-lg text-[#595b61] focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70 font-bold"
          />
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {(['Inner Circle', 'Tribe', 'Extended'] as Relationship['tier'][]).map(t => (
              <button 
                key={t} onClick={() => setTier(t)}
                className={`py-3 md:py-4 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-warrior border transition-all duration-300 ${tier === t ? 'bg-[#f78121] text-white border-[#f78121] shadow-md' : 'bg-black/20 text-white/50 border-white/10 hover:bg-white/10'}`}
              >
                {t}
              </button>
            ))}
          </div>
          <button 
            onClick={addRelationship} 
            className="w-full py-6 md:py-8 bg-[#f78121] text-white rounded-warrior font-black uppercase tracking-[0.2em] shadow-lg flex items-center justify-center space-x-3 md:space-x-4 active:scale-[0.98] transition-all hover:bg-orange-600 text-sm md:text-lg"
          >
            <UserPlus size={20} className="md:w-6 md:h-6" /> <span>Add to Circle (+10 XP)</span>
          </button>
        </div>

        <div className="mt-12 md:mt-20 space-y-10 md:space-y-14">
          {['Inner Circle', 'Tribe', 'Extended'].map(currentTier => (
            <div key={currentTier} className="space-y-6 md:space-y-8">
              <div className="flex items-center justify-between px-2 md:px-3">
                <h4 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-[#f78121] flex items-center">
                  <Shield size={14} className="mr-2 md:mr-3 text-[#f78121] md:w-4 md:h-4" /> {currentTier}
                </h4>
                <span className="text-[10px] md:text-xs text-white/50 font-black uppercase tracking-widest">{data.relationships.filter(r => r.tier === currentTier).length} ACTIVE</span>
              </div>
              <div className="flex flex-wrap gap-3 md:gap-4">
                {data.relationships.filter(r => r.tier === currentTier).map((r, i) => (
                  <div key={i} className="px-5 py-3 md:px-8 md:py-4 rounded-2xl text-xs md:text-sm font-bold text-white flex items-center space-x-3 md:space-x-4 bg-white/10 border border-white/20 hover:bg-white/20 transition-all">
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-[#f78121] rounded-full" />
                    <span className="uppercase tracking-tight">{r.name}</span>
                  </div>
                ))}
                {data.relationships.filter(r => r.tier === currentTier).length === 0 && (
                  <p className="text-[10px] md:text-xs text-white/30 italic font-medium px-4">None added yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default TribeView;
