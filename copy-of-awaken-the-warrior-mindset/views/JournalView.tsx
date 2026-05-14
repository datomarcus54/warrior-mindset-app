
import React, { useState, useMemo } from 'react';
import { UserData, DailyWorkflow } from '../types';
import { Check, Lock, Info, X } from 'lucide-react';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
  isGuest: boolean;
  onRestricted: () => void;
  isMobileMode: boolean;
}

const JournalView: React.FC<Props> = ({ data, update, isGuest, onRestricted, isMobileMode }) => {
  const [showLesson, setShowLesson] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  const currentWorkflow = useMemo(() => {
    return data.dailyWorkflows?.find(w => w.date === today) || {
      date: today,
      mindsetLog: '',
      priorities: [
        { id: '1', text: '', completed: false },
        { id: '2', text: '', completed: false },
        { id: '3', text: '', completed: false }
      ],
      definitionOfDone: '',
      afternoonMomentum: '',
      afternoonPriority: '',
      eveningReflection: { win: '', drain: '', adjustment: '', gratitude: '' },
      shutdownChecklist: { strategicStop: false, brainDump: false, screensDimmed: false },
      brainDumpText: '',
      xpAwarded: { log: false, priorities: 0, doneDef: false, afternoon: false, afternoonPriority: false, evening: false, shutdown: false }
    };
  }, [data.dailyWorkflows, today]);

  const updateWorkflow = (updates: Partial<DailyWorkflow>) => {
    if (isGuest) { onRestricted(); return; }
    const newWorkflow = { ...currentWorkflow, ...updates };
    const otherWorkflows = data.dailyWorkflows?.filter(w => w.date !== today) || [];
    update({ dailyWorkflows: [newWorkflow, ...otherWorkflows] });
  };

  const togglePriority = (idx: number) => {
    const newPriorities = [...currentWorkflow.priorities];
    newPriorities[idx].completed = !newPriorities[idx].completed;
    updateWorkflow({ priorities: newPriorities });
  };

  const updatePriorityText = (idx: number, text: string) => {
    const newPriorities = [...currentWorkflow.priorities];
    newPriorities[idx].text = text;
    updateWorkflow({ priorities: newPriorities });
  };

  const isUnlocked = data.tier === 'Adept' || data.tier === 'Legend';
  
  const RestrictedOverlay = () => (
    <div className="absolute inset-0 z-20 backdrop-blur-sm bg-[#0A3762]/80 flex flex-col items-center justify-center text-center p-6 rounded-xl">
      <Lock size={32} className="text-[#f78121] mb-3" />
      <h4 className="text-lg font-black uppercase tracking-widest text-white mb-2">Restricted Intel</h4>
      <p className="text-xs text-[#45d0d0] mb-4 max-w-[240px]">Upgrade to Adept Class to unlock the full Journal.</p>
      {!isMobileMode && (
         <button onClick={() => update({ tier: 'Adept' })} className="px-6 py-2 bg-[#f78121] text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white hover:text-[#0A3762] transition-all">
           Unlock Access
         </button>
      )}
    </div>
  );

  return (
    <div className="space-y-8 pb-20">
       
       {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-[#45d0d0]/30 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">The Daily War</h3>
              <p className="text-base text-white font-medium leading-relaxed italic">
                "Win the morning, win the day. The journal is your tactical map."
              </p>
           </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Daily Journal</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Daily Execution System</p>
      </header>

      {/* I. DAILY INTENTION */}
      <section className="glass-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
        <h3 className="text-lg font-black uppercase tracking-widest text-[#f78121] mb-6">I. Daily Intention</h3>
        <textarea 
          value={currentWorkflow.mindsetLog}
          onChange={(e) => updateWorkflow({ mindsetLog: e.target.value })}
          placeholder="Clear the fog. State your intent..."
          className="w-full h-32 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70"
        />
      </section>

      {/* II. MORNING PRIORITY BLOCK */}
      <section className="glass-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
         <h3 className="text-lg font-black uppercase tracking-widest text-[#f78121] mb-6">II. Morning Priority Block</h3>
        <div className="space-y-4 mb-6">
          {currentWorkflow.priorities.map((p, idx) => (
             <div key={idx} className="flex items-center space-x-3">
                <button 
                  onClick={() => togglePriority(idx)}
                  className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${p.completed ? 'bg-[#f78121] border-[#f78121]' : 'border-[#45d0d0]/30 hover:border-[#f78121] bg-black/10'}`}
                >
                  {p.completed && <Check size={18} className="text-white" />}
                </button>
                <input 
                  type="text" 
                  value={p.text}
                  onChange={(e) => updatePriorityText(idx, e.target.value)}
                  placeholder={`Primary Objective ${idx + 1}`}
                  className={`flex-1 bg-[#eef1f1] border-b border-transparent focus:border-[#f78121] py-2 px-3 text-sm text-[#595b61] font-bold transition-all rounded ${p.completed ? 'line-through text-slate-400' : ''}`}
                />
             </div>
          ))}
        </div>
        <div>
           <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0] mb-2 block">Definition of Success</label>
           <input 
              type="text"
              value={currentWorkflow.definitionOfDone}
              onChange={(e) => updateWorkflow({ definitionOfDone: e.target.value })}
              placeholder="What does absolute victory look like today?"
              className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-3 text-sm text-[#595b61] font-bold focus:border-[#f78121] placeholder:text-[#595b61]/70"
           />
        </div>
      </section>

      {/* III. MID-DAY CHECK-IN */}
      <section className="glass-card p-6 md:p-8 relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1">
        {!isUnlocked && <RestrictedOverlay />}
        <h3 className="text-lg font-black uppercase tracking-widest text-[#f78121] mb-6">III. Mid-Day Check-In</h3>
        <textarea 
          value={currentWorkflow.afternoonMomentum}
          onChange={(e) => updateWorkflow({ afternoonMomentum: e.target.value })}
          placeholder="Pivot or Persist? Log reality..."
          className="w-full h-24 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70"
        />
      </section>

      {/* IV. AFTERNOON PRIORITIES */}
      <section className="glass-card p-6 md:p-8 relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1">
        {!isUnlocked && <RestrictedOverlay />}
        <h3 className="text-lg font-black uppercase tracking-widest text-[#f78121] mb-6">IV. Afternoon Priorities</h3>
        <textarea 
          value={currentWorkflow.afternoonPriority}
          onChange={(e) => updateWorkflow({ afternoonPriority: e.target.value })}
          placeholder="Second-half targets (Free Form)..."
          className="w-full h-32 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70"
        />
      </section>

      {/* V. EVENING REFLECTION */}
      <section className="glass-card p-6 md:p-8 relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1">
        {!isUnlocked && <RestrictedOverlay />}
        <h3 className="text-lg font-black uppercase tracking-widest text-[#f78121] mb-6">V. Evening Reflection</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0]">Today's Victory</label>
             <input value={currentWorkflow.eveningReflection.win} onChange={(e) => updateWorkflow({ eveningReflection: { ...currentWorkflow.eveningReflection, win: e.target.value } })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-3 text-sm focus:border-[#f78121] text-[#595b61] font-bold" />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0]">Energy Drain</label>
             <input value={currentWorkflow.eveningReflection.drain} onChange={(e) => updateWorkflow({ eveningReflection: { ...currentWorkflow.eveningReflection, drain: e.target.value } })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-3 text-sm focus:border-[#f78121] text-[#595b61] font-bold" />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0]">Tomorrow's Adjustment</label>
             <input value={currentWorkflow.eveningReflection.adjustment} onChange={(e) => updateWorkflow({ eveningReflection: { ...currentWorkflow.eveningReflection, adjustment: e.target.value } })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-3 text-sm focus:border-[#f78121] text-[#595b61] font-bold" />
           </div>
           <div className="space-y-1">
             <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0]">Gratitude</label>
             <input value={currentWorkflow.eveningReflection.gratitude} onChange={(e) => updateWorkflow({ eveningReflection: { ...currentWorkflow.eveningReflection, gratitude: e.target.value } })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-3 text-sm focus:border-[#f78121] text-[#595b61] font-bold" />
           </div>
        </div>

        <div className="bg-black/20 rounded-xl p-6 border border-[#45d0d0]/20 mb-6">
           <h4 className="text-xs font-black uppercase tracking-widest text-[#45d0d0] mb-4">Shutdown Protocol</h4>
           <div className="space-y-3">
              {[
                { label: 'Strategic Stop (No New Inputs)', key: 'strategicStop' },
                { label: 'Brain Dump Completed', key: 'brainDump' },
                { label: 'Screens Dimmed', key: 'screensDimmed' }
              ].map((item) => (
                 <button 
                   key={item.key}
                   onClick={() => updateWorkflow({ shutdownChecklist: { ...currentWorkflow.shutdownChecklist, [item.key]: !currentWorkflow.shutdownChecklist[item.key as keyof typeof currentWorkflow.shutdownChecklist] } })}
                   className="flex items-center space-x-3 w-full text-left group"
                 >
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${currentWorkflow.shutdownChecklist[item.key as keyof typeof currentWorkflow.shutdownChecklist] ? 'bg-[#f78121] border-[#f78121]' : 'border-[#45d0d0]/40 bg-black/20 group-hover:border-[#f78121]'}`}>
                       {currentWorkflow.shutdownChecklist[item.key as keyof typeof currentWorkflow.shutdownChecklist] && <Check size={14} className="text-white" />}
                    </div>
                    <span className={`text-sm font-bold ${currentWorkflow.shutdownChecklist[item.key as keyof typeof currentWorkflow.shutdownChecklist] ? 'text-white' : 'text-slate-400'}`}>{item.label}</span>
                 </button>
              ))}
           </div>
        </div>

        <div className="relative">
           <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0] mb-2 block">Tomorrow's Brain Dump</label>
           <textarea 
             value={currentWorkflow.brainDumpText}
             onChange={(e) => updateWorkflow({ brainDumpText: e.target.value })}
             placeholder="Clear the mind..."
             className="w-full h-32 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70"
           />
        </div>
      </section>

    </div>
  );
};

export default JournalView;
