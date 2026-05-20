import React, { useState } from 'react';
import { UserData, Relationship } from '../types';
import { Shield, Users, DollarSign, Wallet, PiggyBank, Briefcase, Plus, Heart, Target, UserPlus, Info, Pencil, Trash2, Check, X } from 'lucide-react';
import EmptyState from './EmptyState';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
}

const RelationalFinancial: React.FC<Props> = ({ data, update }) => {
  const [activeTab, setActiveTab] = useState<'Relational' | 'Financial'>('Relational');
  const [newRelName, setNewRelName] = useState('');
  const [newRelTier, setNewRelTier] = useState<Relationship['tier']>('Inner Circle');
  const [editingRelIdx, setEditingRelIdx] = useState<number | null>(null);
  const [editRelName, setEditRelName] = useState('');
  const [editRelTier, setEditRelTier] = useState<Relationship['tier']>('Inner Circle');

  const hasWealthData =
    (data.financialData?.assets?.liquid?.length || 0) > 0 ||
    (data.financialData?.assets?.fixed?.length || 0) > 0 ||
    (data.financialData?.liabilities?.shortTerm?.length || 0) > 0 ||
    (data.financialData?.liabilities?.longTerm?.length || 0) > 0;

  const deleteRelationship = (idx: number) => {
    if (!window.confirm('Remove this person from your tribe?')) return;
    update({ relationships: data.relationships.filter((_, i) => i !== idx) });
  };

  const startEditRel = (idx: number) => {
    setEditingRelIdx(idx);
    setEditRelName(data.relationships[idx].name);
    setEditRelTier(data.relationships[idx].tier);
  };

  const saveRelEdit = () => {
    if (editingRelIdx === null || !editRelName.trim()) return;
    update({ relationships: data.relationships.map((r, i) => i === editingRelIdx ? { ...r, name: editRelName, tier: editRelTier } : r) });
    setEditingRelIdx(null);
  };

  const addRelationship = () => {
    if (!newRelName.trim()) return;
    update({ 
      relationships: [...data.relationships, { name: newRelName, tier: newRelTier, strength: 5 }],
      warriorCodePoints: data.warriorCodePoints + 10
    });
    setNewRelName('');
  };

  return (
    <div className="space-y-10 pb-10">
      <div className="flex p-1.5 glass-card shadow-inner">
        <button 
          onClick={() => setActiveTab('Relational')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-warrior transition-all duration-500 ${activeTab === 'Relational' ? 'bg-resilience-gold text-dark-base shadow-lg glow-gold' : 'text-slate-500 hover:text-off-white'}`}
        >
          Tribe Architecture
        </button>
        <button 
          onClick={() => setActiveTab('Financial')}
          className={`flex-1 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-warrior transition-all duration-500 ${activeTab === 'Financial' ? 'bg-resilience-gold text-dark-base shadow-lg glow-gold' : 'text-slate-500 hover:text-off-white'}`}
        >
          Wealth Shield
        </button>
      </div>

      {activeTab === 'Relational' ? (
        <section className="space-y-8">
          <header className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl glow-blue">
              <Users className="text-blue-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-brand-header uppercase text-resilience-gold tracking-tight">Tribe Network</h2>
              <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]">Social Infrastructure Analysis</p>
            </div>
          </header>

          <section className="glass-card p-10 shadow-glass">
             <p className="text-[11px] text-slate-400 mb-8 leading-relaxed font-medium italic">
               "You are the average of the five warriors you share the trenches with. Map your circle with intent."
             </p>
             
             <div className="space-y-4 mb-10">
               <input 
                  type="text" 
                  value={newRelName}
                  onChange={(e) => setNewRelName(e.target.value)}
                  placeholder="Recruit Name..."
                  className="w-full bg-white/5 border border-white/10 rounded-warrior px-6 py-4 text-sm text-off-white focus:outline-none focus:border-resilience-gold/40 transition-all"
               />
               <div className="flex gap-3">
                 <select 
                   value={newRelTier}
                   onChange={(e) => setNewRelTier(e.target.value as any)}
                   className="flex-1 bg-white/5 border border-white/10 rounded-warrior px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 focus:outline-none bg-dark-charcoal"
                 >
                   <option className="bg-dark-charcoal">Inner Circle</option>
                   <option className="bg-dark-charcoal">Tribe</option>
                   <option className="bg-dark-charcoal">Extended</option>
                 </select>
                 <button onClick={addRelationship} className="bg-resilience-gold text-dark-base px-8 rounded-warrior font-black uppercase tracking-widest active:scale-95 transition-all shadow-lg">
                   Recruit
                 </button>
               </div>
             </div>

             <div className="space-y-10">
                {['Inner Circle', 'Tribe', 'Extended'].map(tier => (
                  <div key={tier} className="space-y-4">
                    <h3 className="text-[10px] text-resilience-gold font-black uppercase tracking-[0.3em] flex items-center">
                      <Shield size={12} className="mr-3 glow-gold" />
                      {tier}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {data.relationships.map((r, gIdx) => ({ r, gIdx })).filter(({ r }) => r.tier === tier).map(({ r, gIdx }) => (
                        editingRelIdx === gIdx ? (
                          <div key={gIdx} className="glass-card p-3 rounded-2xl flex items-center gap-2">
                            <input value={editRelName} onChange={(e) => setEditRelName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveRelEdit()} className="bg-white/5 border border-resilience-gold/40 rounded-lg px-3 py-1.5 text-[11px] text-off-white outline-none w-28 focus:border-resilience-gold" />
                            <select value={editRelTier} onChange={(e) => setEditRelTier(e.target.value as Relationship['tier'])} className="bg-dark-charcoal border border-white/10 rounded-lg px-1 py-1 text-[10px] text-slate-400 outline-none">
                              <option>Inner Circle</option><option>Tribe</option><option>Extended</option>
                            </select>
                            <button onClick={saveRelEdit} className="text-green-400 hover:text-white transition-colors"><Check size={14}/></button>
                            <button onClick={() => setEditingRelIdx(null)} className="text-white/40 hover:text-white transition-colors"><X size={12}/></button>
                          </div>
                        ) : (
                          <div key={gIdx} className="glass-card px-4 py-3 rounded-2xl text-[11px] font-bold text-off-white flex items-center gap-2 transition-all hover:bg-white/10 group">
                            <div className="w-2 h-2 bg-growth-green rounded-full shadow-[0_0_8px_rgba(46,204,113,0.5)]" />
                            <span>{r.name}</span>
                            <button onClick={() => startEditRel(gIdx)} className="text-white/20 hover:text-resilience-gold transition-colors opacity-0 group-hover:opacity-100"><Pencil size={11}/></button>
                            <button onClick={() => deleteRelationship(gIdx)} className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 size={11}/></button>
                          </div>
                        )
                      ))}
                      {data.relationships.filter(r => r.tier === tier).length === 0 && (
                        <p className="text-[10px] text-slate-600 italic font-medium px-2">No allies mapped in this sector.</p>
                      )}
                    </div>
                  </div>
                ))}
             </div>
          </section>
        </section>
      ) : (
        <section className="space-y-8">
          <header className="flex items-center space-x-4">
            <div className="p-3 bg-emerald-500/10 rounded-2xl glow-blue">
              <DollarSign className="text-emerald-400" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black font-brand-header uppercase text-resilience-gold tracking-tight">Wealth Shield</h2>
              <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]">6-Pillar Financial Security</p>
            </div>
          </header>

          <section className="glass-card p-10 shadow-glass">
             <div className="flex items-start space-x-4 mb-10 glass-card p-6">
                <Info size={20} className="text-resilience-gold mt-1 flex-shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed font-medium">
                  "Financial freedom is the fuel for your mission. Rebuilding from RM3.2M debt taught me: the number is secondary to the system."
                </p>
             </div>
             
             {hasWealthData ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   { icon: Wallet, label: 'Income Streams', color: 'text-sky-400', bg: 'bg-sky-400/10' },
                   { icon: Briefcase, label: 'Growth Assets', color: 'text-indigo-400', bg: 'bg-indigo-400/10' },
                   { icon: PiggyBank, label: 'Defensive Fund', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
                   { icon: DollarSign, label: 'Cash Flow', color: 'text-amber-400', bg: 'bg-amber-400/10' },
                   { icon: Shield, label: 'Risk Coverage', color: 'text-rose-400', bg: 'bg-rose-400/10' },
                   { icon: Heart, label: 'Philanthropy', color: 'text-pink-400', bg: 'bg-pink-400/10' }
                 ].map((pillar) => (
                   <div key={pillar.label} className="glass-card p-8 flex flex-col items-center group hover:bg-white/5 transition-all">
                      <div className={`p-5 ${pillar.bg} rounded-3xl mb-4 group-hover:scale-110 transition-transform`}>
                        <pillar.icon size={28} className={pillar.color} />
                      </div>
                      <span className="text-[11px] text-off-white font-black uppercase tracking-widest text-center mb-6">{pillar.label}</span>
                      <button className="w-full py-3 text-[9px] font-black uppercase tracking-widest text-resilience-gold border border-resilience-gold/30 rounded-xl hover:bg-resilience-gold hover:text-dark-base transition-all active:scale-95">
                        Recalibrate Pillar
                      </button>
                   </div>
                 ))}
               </div>
             ) : (
               <EmptyState
                 heading="Your Wealth Journey Starts Here"
                 message="Add your first asset or liability to begin tracking your financial foundation."
                 buttonLabel="Add Your First Entry"
                 onButtonClick={() => {}}
               />
             )}
          </section>
        </section>
      )}
    </div>
  );
};

export default RelationalFinancial;