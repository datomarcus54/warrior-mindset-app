
import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Flame, Zap, ListChecks, Info, X, Check, BarChart3, Pencil } from 'lucide-react';
import { UserData, Habit } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
}

const HabitLaboratory: React.FC<Props> = ({ data, update }) => {
  const [newHabitName, setNewHabitName] = useState('');
  const [showLesson, setShowLesson] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editHabitName, setEditHabitName] = useState('');
  
  // --- SAFETY CHECK START ---
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  // --- SAFETY CHECK END ---

  const addHabit = () => {
    if (!newHabitName.trim()) return;
    const newHabit: Habit = { id: Date.now().toString(), name: newHabitName, streak: 0, lastCompleted: null };
    update({ habits: [...data.habits, newHabit] });
    setNewHabitName('');
  };

  const deleteHabit = (id: string) => {
    if (!window.confirm('Delete this habit?')) return;
    update({ habits: data.habits.filter(h => h.id !== id) });
  };

  const startEditHabit = (habit: Habit) => { setEditingHabitId(habit.id); setEditHabitName(habit.name); };
  const saveHabitEdit = (id: string) => {
    if (!editHabitName.trim()) return;
    update({ habits: data.habits.map(h => h.id === id ? { ...h, name: editHabitName } : h) });
    setEditingHabitId(null);
  };

  const toggleHabit = (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    let xpAwarded = 0;
    const newHabits = data.habits.map(h => {
      if (h.id === id) {
        if (h.lastCompleted === today) {
          xpAwarded = -5;
          return { ...h, lastCompleted: null, streak: Math.max(0, h.streak - 1) };
        } else {
          xpAwarded = 5;
          return { ...h, lastCompleted: today, streak: h.streak + 1 };
        }
      }
      return h;
    });
    update({ habits: newHabits, warriorCodePoints: Math.max(0, data.warriorCodePoints + xpAwarded) });
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-10 md:space-y-12 pb-24 mt-24 px-6 md:px-12 max-w-5xl mx-auto">
      
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border-4 border-[#001b3d] rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">Minimum Viable Infrastructure</h3>
              <p className="text-base text-white font-medium leading-relaxed italic">
                "Motivation is for amateurs. Professionals have systems. Forge an unbreakable routine that sustains you when the excitement fades."
              </p>
           </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap" style={{ fontFamily: 'Anton, sans-serif' }}>Discipline Foundry</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Automated Systems</p>
      </header>

      {/* Analytics Chart - SAFE MOUNT APPLIED */}
      {data.habits.length > 0 && (
        <section className="glass-card p-6 md:p-10 mb-8 bg-[#595b61] rounded-2xl transition-all duration-300 ease-in-out hover:-translate-y-1">
          <div className="flex items-center gap-2 mb-6">
             <BarChart3 className="text-[#f78121]" size={20} />
             <h3 className="text-sm font-black uppercase tracking-widest text-white">Consistency Metrics</h3>
          </div>
          
          {/* SAFETY WRAPPER - FIXED HEIGHT */}
          <div className="w-full h-[350px] min-h-[350px] relative">
            {isMounted ? (
              <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={data.habits} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff" strokeOpacity={0.1} horizontal={false} />
                    <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis dataKey="name" type="category" stroke="#fff" fontSize={11} tickLine={false} axisLine={false} width={100} />
                    <Tooltip 
                      cursor={{fill: 'transparent'}}
                      contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                      itemStyle={{ color: '#f78121' }}
                    />
                    <Bar dataKey="streak" radius={[0, 4, 4, 0]} barSize={20}>
                       {data.habits.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.lastCompleted === today ? '#45d0d0' : '#f78121'} />
                       ))}
                    </Bar>
                 </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full bg-[#4a4c52] animate-pulse rounded-xl flex items-center justify-center">
                 <span className="text-white/50 text-xs font-bold uppercase tracking-widest">Calibrating Analytics...</span>
              </div>
            )}
          </div>
        </section>
      )}

      {/* HABIT INPUT & LIST */}
      <section className="glass-card p-6 md:p-10 bg-[#595b61] rounded-2xl shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="flex space-x-3 md:space-x-4 mb-8 md:mb-12">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addHabit()}
            placeholder="Add new habit..."
            className="flex-1 bg-[#eef1f1] rounded-lg px-4 md:px-8 py-4 md:py-5 text-base md:text-lg text-[#595b61] font-bold focus:outline-none focus:ring-2 focus:ring-[#f78121] transition-all placeholder:text-[#595b61]/70"
          />
          <button onClick={addHabit} className="bg-[#f78121] text-[#001b3d] p-4 md:p-5 rounded-lg hover:bg-[#ff9545] transition-all active:scale-95 shadow-lg font-black">
            <Plus size={24} className="md:w-7 md:h-7" />
          </button>
        </div>

        <div className="space-y-4">
          {data.habits.length === 0 ? (
            <div className="text-center py-16 md:py-24 opacity-40 italic">
               <ListChecks size={48} className="mx-auto mb-4 md:mb-6 text-white md:w-14 md:h-14" />
               <p className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-white">System Idle. Engage.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {data.habits.map(habit => {
                const isCompletedToday = habit.lastCompleted === today;
                return (
                  <div key={habit.id} className={`bg-white/5 border transition-all duration-300 rounded-xl p-4 md:p-6 flex items-center justify-between group ${isCompletedToday ? 'border-[#45d0d0] bg-[#45d0d0]/10' : 'border-transparent hover:border-[#f78121]/30 hover:bg-white/10'}`}>
                     <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <button
                          onClick={() => toggleHabit(habit.id)}
                          className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center transition-all flex-shrink-0 ${isCompletedToday ? 'bg-[#45d0d0] text-[#001b3d] shadow-lg scale-110' : 'bg-black/20 text-white/30 hover:text-white hover:bg-[#f78121]'}`}
                        >
                           {isCompletedToday ? <Check size={24} strokeWidth={3} /> : <Zap size={20} />}
                        </button>
                        <div className="flex-1 min-w-0">
                           {editingHabitId === habit.id ? (
                             <div className="flex items-center gap-2">
                               <input value={editHabitName} onChange={(e) => setEditHabitName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveHabitEdit(habit.id)} autoFocus className="flex-1 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-lg px-3 py-1.5 text-sm text-[#595b61] font-bold focus:border-[#f78121] outline-none" />
                               <button onClick={() => saveHabitEdit(habit.id)} className="text-[#45d0d0] hover:text-white transition-colors"><Check size={16}/></button>
                               <button onClick={() => setEditingHabitId(null)} className="text-white/40 hover:text-white transition-colors"><X size={14}/></button>
                             </div>
                           ) : (
                             <h4 className={`text-sm md:text-base font-black uppercase tracking-wide ${isCompletedToday ? 'text-[#45d0d0]' : 'text-white'}`}>{habit.name}</h4>
                           )}
                           <div className="flex items-center space-x-1 text-xs font-bold text-white/50 mt-1">
                              <Flame size={12} className={habit.streak > 0 ? 'text-[#f78121]' : 'text-white/20'} />
                              <span className={habit.streak > 0 ? 'text-[#f78121]' : ''}>{habit.streak} Day Streak</span>
                           </div>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                       {editingHabitId !== habit.id && <button onClick={() => startEditHabit(habit)} className="text-white/20 hover:text-[#45d0d0] transition-colors p-2"><Pencil size={16}/></button>}
                       <button onClick={() => deleteHabit(habit.id)} className="text-white/20 hover:text-red-400 transition-colors p-2"><Trash2 size={18} /></button>
                     </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default HabitLaboratory;
