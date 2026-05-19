
import React, { useState, useRef } from 'react';
import { UserData, FailureLog } from '../types';
import ChallengeNavigator from './ChallengeNavigator';
import { Brain, Sparkles, Trash2, ArrowRight, AlertTriangle, Zap, History, Info, X } from 'lucide-react';
import EmptyState from './EmptyState';

const LESSONS = {
  'MINDSET': { title: "Cognitive Reconfiguration", text: "Master your internal command center. Your thoughts are your first battlefield; win there, and all else follows." },
  'FAILURE': { title: "Extracting Lethal Growth", text: "Every setback is a data point, not a defeat. Analyze, adapt, and become exponentially stronger from every challenge." }
};

const ResilienceView: React.FC<{ data: UserData; update: (u: Partial<UserData>) => void; isGuest: boolean; onRestricted: () => void }> = ({ data, update, isGuest, onRestricted }) => {
  const eventInputRef = useRef<HTMLInputElement>(null);
  const [distorted, setDistorted] = useState('');
  const [balanced, setBalanced] = useState('');
  const [activeLesson, setActiveLesson] = useState<keyof typeof LESSONS | null>(null);
  const [event, setEvent] = useState('');
  const [lesson, setLesson] = useState('');
  const [action, setAction] = useState('');

  const addJournal = () => {
    if (isGuest) { onRestricted(); return; }
    if (!distorted || !balanced) return;
    const newEntry = { id: Date.now().toString(), distorted, balanced, timestamp: new Date().toISOString() };
    update({ journals: [newEntry, ...data.journals], warriorCodePoints: data.warriorCodePoints + 15 });
    setDistorted(''); setBalanced('');
  };

  const deleteJournal = (id: string) => {
    if (isGuest) { onRestricted(); return; }
    update({ journals: data.journals.filter(j => j.id !== id) });
  };

  const addFailure = () => {
    if (isGuest) { onRestricted(); return; }
    if (!event || !lesson || !action) return;
    const newLog: FailureLog = { id: Date.now().toString(), event, lesson, action, timestamp: new Date().toISOString() };
    update({ failures: [newLog, ...data.failures], warriorCodePoints: data.warriorCodePoints + 50 });
    setEvent(''); setLesson(''); setAction('');
  };

  return (
    <div className="space-y-12 md:space-y-16 pb-20">
      
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-[#45d0d0] rounded-2xl shadow-2xl">
              <button onClick={() => setActiveLesson(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">{LESSONS[activeLesson].title}</h3>
              <p className="text-base text-white font-medium leading-relaxed italic">"{LESSONS[activeLesson].text}"</p>
           </div>
        </div>
      )}

      <ChallengeNavigator data={data} update={update} />

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-10" />

      <section className="glass-card p-6 md:p-10 shadow-glass transition-all duration-300 ease-in-out hover:shadow-[0_0_25px_rgba(247,129,33,0.4)] hover:border-[#f78121]/50 hover:-translate-y-1">
        <div className="flex items-center gap-[10px] mb-8">
            <h3 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-tight text-[#f78121]">Resilience Forge</h3>
            <button onClick={() => setActiveLesson('MINDSET')} className="text-[#f78121] hover:text-white cursor-pointer transition-colors"><Info size={24} /></button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#f78121] flex items-center"><AlertTriangle size={12} className="mr-2" /> Mental Sabotage</label>
            <textarea value={distorted} onChange={(e) => setDistorted(e.target.value)} placeholder="Locate the point of failure..." className="w-full h-32 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-warrior p-4 text-sm text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70" />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0] flex items-center"><Sparkles size={12} className="mr-2" /> Reframing</label>
            <textarea value={balanced} onChange={(e) => setBalanced(e.target.value)} placeholder="Re-engage with logic..." className="w-full h-32 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-warrior p-4 text-sm text-[#595b61] font-bold focus:outline-none focus:border-[#45d0d0] transition-all placeholder:text-[#595b61]/70" />
          </div>
        </div>
        <button onClick={addJournal} disabled={!distorted || !balanced} className="w-full py-4 bg-[#f78121] hover:bg-orange-600 text-white font-black uppercase tracking-[0.2em] rounded-warrior transition-all disabled:opacity-50 flex items-center justify-center space-x-2"><Brain size={18} /> <span>Lock Reframe</span></button>

        <div className="mt-8 space-y-4">
          {data.journals.map(entry => (
            <div key={entry.id} className="bg-black/20 border border-white/10 rounded-xl p-6 relative group shadow-sm hover:shadow-md transition-all">
               <button onClick={() => deleteJournal(entry.id)} className="absolute top-4 right-4 text-white/30 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div><span className="text-[10px] text-[#f78121] font-black uppercase tracking-widest mb-1 block">Glitch</span><p className="text-sm text-white/70 font-medium italic">"{entry.distorted}"</p></div>
                 <div className="flex items-start"><ArrowRight className="text-white/30 mx-2 mt-1 hidden md:block" size={16} /><div><span className="text-[10px] text-[#45d0d0] font-black uppercase tracking-widest mb-1 block">Reality</span><p className="text-sm text-white font-bold">"{entry.balanced}"</p></div></div>
               </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-10" />

      <section className="glass-card p-6 md:p-10 shadow-glass transition-all duration-300 ease-in-out hover:shadow-[0_0_25px_rgba(247,129,33,0.4)] hover:border-[#f78121]/50 hover:-translate-y-1">
        <div className="flex items-center gap-[10px] mb-8">
            <h3 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-tight text-[#f78121]">After Action Report (AAR)</h3>
            <button onClick={() => setActiveLesson('FAILURE')} className="text-[#f78121] hover:text-white cursor-pointer transition-colors"><Info size={24} /></button>
        </div>

        <div className="space-y-4 mb-8">
           <input ref={eventInputRef} value={event} onChange={e => setEvent(e.target.value)} placeholder="Describe what happened..." className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:border-[#f78121] outline-none placeholder:text-[#595b61]/70" />
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input value={lesson} onChange={e => setLesson(e.target.value)} placeholder="What did you learn?" className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:border-[#45d0d0] outline-none placeholder:text-[#595b61]/70" />
              <input value={action} onChange={e => setAction(e.target.value)} placeholder="What will you do differently?" className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:border-[#f78121] outline-none placeholder:text-[#595b61]/70" />
           </div>
           <button onClick={addFailure} disabled={!event || !lesson || !action} className="w-full py-4 bg-[#f78121] text-white rounded-warrior font-black uppercase tracking-[0.2em] shadow-lg hover:bg-orange-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"><Zap size={18} /> <span>Log Growth (+50 Steps)</span></button>
        </div>

        <div className="space-y-4">
           {data.failures.length === 0 ? (
             <EmptyState
               heading="No Reviews Yet"
               message="Every experience holds a lesson. Record your first After Action Review to begin growing."
               buttonLabel="Record Your First Review"
               onButtonClick={() => eventInputRef.current?.focus()}
             />
           ) : data.failures.map(log => (
             <div key={log.id} className="bg-black/20 border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                   <div className="flex items-center space-x-2"><History size={16} className="text-white/50" /><span className="text-xs font-bold text-white/50">{new Date(log.timestamp).toLocaleDateString()}</span></div>
                   <button onClick={() => { if(isGuest) onRestricted(); else update({ failures: data.failures.filter(f => f.id !== log.id) }) }} className="text-white/30 hover:text-red-500"><Trash2 size={16}/></button>
                </div>
                <h4 className="text-base font-bold text-white mb-2">{log.event}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                   <div className="p-3 bg-[#45d0d0]/10 rounded-xl border border-[#45d0d0]/20"><span className="text-[10px] uppercase font-black tracking-widest text-[#45d0d0] block mb-1">Learning</span>{log.lesson}</div>
                   <div className="p-3 bg-[#f78121]/10 rounded-xl border border-[#f78121]/20"><span className="text-[10px] uppercase font-black tracking-widest text-[#f78121] block mb-1">Action Plan</span>{log.action}</div>
                </div>
             </div>
           ))}
        </div>
      </section>
    </div>
  );
};

export default ResilienceView;
