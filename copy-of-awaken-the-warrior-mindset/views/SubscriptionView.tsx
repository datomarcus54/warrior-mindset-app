import React from 'react';
import { Shield, Trophy, Star, Target, CheckCircle2 } from 'lucide-react';
import { UserData } from '../types';
import { getRank, WARRIOR_RANKS } from '../constants';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
}

const SubscriptionView: React.FC<Props> = ({ data, update }) => {
  const currentRank = getRank(data.warriorCodePoints);
  const nextRank = WARRIOR_RANKS[WARRIOR_RANKS.indexOf(currentRank) + 1] || null;
  const progress = nextRank 
    ? ((data.warriorCodePoints - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100 
    : 100;
  
  const xpNeeded = nextRank ? nextRank.minPoints - data.warriorCodePoints : 0;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      {/* HEADER SECTION */}
      <div className="text-center space-y-4">
         <div className="inline-flex p-4 rounded-full bg-[#f78121]/10 border border-[#f78121]/30 mb-2">
            <Trophy size={48} className="text-[#f78121]" />
         </div>
         <h2 className="text-4xl md:text-5xl font-black font-brand-header uppercase text-white tracking-wide">
            {currentRank.name}
         </h2>
         <p className="text-[#45d0d0] text-sm font-black uppercase tracking-[0.2em]">Current Active Status</p>
      </div>

      {/* PROGRESS BAR */}
      <section className="glass-card p-8 md:p-10 relative overflow-hidden">
         <div className="flex justify-between items-end mb-4">
            <div>
               <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Current XP</p>
               <p className="text-3xl font-black text-white">{data.warriorCodePoints.toLocaleString()}</p>
            </div>
            {nextRank && (
               <div className="text-right">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">Next Rank: {nextRank.name}</p>
                   <p className="text-xl font-black text-[#f78121]">{xpNeeded.toLocaleString()} XP Needed</p>
               </div>
            )}
         </div>

         <div className="h-4 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div 
               className="h-full bg-gradient-to-r from-[#f78121] to-[#ff9f43] transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(247,129,33,0.6)]" 
               style={{ width: `${progress}%` }} 
            />
         </div>
      </section>

      {/* TIERS GRID (INFORMATIONAL ONLY - NO PAYMENTS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {WARRIOR_RANKS.map((rank) => {
            const isUnlocked = data.warriorCodePoints >= rank.minPoints;
            const isNext = !isUnlocked && data.warriorCodePoints < rank.minPoints && (!nextRank || rank.name === nextRank.name);
            
            return (
               <div 
                  key={rank.name} 
                  className={`relative p-6 rounded-2xl border transition-all duration-300 ${
                     isUnlocked 
                        ? 'bg-[#f78121]/10 border-[#f78121] shadow-[0_0_20px_rgba(247,129,33,0.15)]' 
                        : isNext 
                           ? 'bg-white/5 border-white/20 hover:border-[#f78121]/50' 
                           : 'bg-black/20 border-white/5 opacity-50'
                  }`}
               >
                  {isUnlocked && (
                     <div className="absolute top-4 right-4 text-[#f78121]">
                        <CheckCircle2 size={24} />
                     </div>
                  )}
                  
                  <Shield size={32} className={`mb-4 ${isUnlocked ? 'text-[#f78121]' : 'text-slate-500'}`} />
                  
                  <h3 className={`text-xl font-black uppercase tracking-wider mb-2 ${isUnlocked ? 'text-white' : 'text-slate-400'}`}>
                     {rank.name}
                  </h3>
                  <p className="text-xs font-bold text-[#45d0d0] uppercase tracking-widest mb-6">
                     {rank.minPoints}+ XP Required
                  </p>
                  
                  <ul className="space-y-3">
                     {rank.name === 'Novice' && (
                        <>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> Foundation Module</li>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> Basic Journaling</li>
                        </>
                     )}
                     {rank.name === 'Adept' && (
                        <>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> Full Journal Access</li>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> Advanced Analytics</li>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> Habit Laboratory</li>
                        </>
                     )}
                     {rank.name === 'Legend' && (
                        <>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> Tribe Architecture</li>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> Legacy & Impact</li>
                           <li className="flex items-center text-xs text-slate-300"><Star size={12} className="mr-2 text-[#45d0d0]"/> God Mode Access</li>
                        </>
                     )}
                  </ul>

                  {!isUnlocked && (
                     <div className="mt-6 pt-6 border-t border-white/10 flex items-center justify-center">
                        <Target size={16} className="text-slate-500 mr-2" />
                        <span className="text-xs text-slate-500 font-bold uppercase tracking-widest">LOCKED</span>
                     </div>
                  )}
               </div>
            );
         })}
      </div>
    </div>
  );
};

export default SubscriptionView;