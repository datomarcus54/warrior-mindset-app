
import React, { useState } from 'react';
import { Plus, Target, CheckCircle2, Circle, Trash2, Trophy, Bot, X, Calendar, BarChart3, Info, Flag } from 'lucide-react';
import { UserData, Goal, Milestone } from '../types';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
}

const CATEGORIES: Goal['category'][] = ['Weekly', 'Short-Term', 'Mid-Range', 'Big Vision'];

const TIMELINE_CONFIG = {
  'Weekly': { label: '7 Days', width: '15%' },
  'Short-Term': { label: '6 Months', width: '40%' },
  'Mid-Range': { label: '1 Year', width: '70%' },
  'Big Vision': { label: '3 Years', width: '100%' }
};

const COACH_PHRASES = {
  start: ["The journey begins now. Execute.", "Zero is temporary. Action is mandatory.", "Awaiting your first move, Warrior."],
  progress: ["Good. Friction proves you are moving.", "Momentum is building. Don't let up.", "You are chipping away at the marble."],
  near: ["Stay frosty. Complacency kills at the finish line.", "Visualise the victory, then take it.", "The summit is in sight. Push."],
  complete: ["Mission Accomplished. Outstanding.", "Victory secured. Calibrate for the next target.", "This is what antifragility looks like."]
};

const GoalMaster: React.FC<Props> = ({ data, update }) => {
  const [newGoalText, setNewGoalText] = useState('');
  const [activeCategory, setActiveCategory] = useState<Goal['category']>('Weekly');
  const [showLesson, setShowLesson] = useState(false);
  const [milestoneInputs, setMilestoneInputs] = useState<{[key: string]: string}>({});
  const [celebration, setCelebration] = useState<{show: boolean, text: string, coachMsg?: string}>({ show: false, text: '' });

  const addGoal = () => {
    if (!newGoalText.trim()) return;
    const newGoal: Goal = {
      id: Date.now().toString(),
      text: newGoalText,
      category: activeCategory,
      completed: false,
      milestones: []
    };
    update({ goals: [...data.goals, newGoal], warriorCodePoints: data.warriorCodePoints + 5 });
    setNewGoalText('');
  };

  const toggleGoal = (id: string) => {
    const isNowCompleted = !data.goals.find(g => g.id === id)?.completed;
    const newGoals = data.goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g);
    const xpReward = isNowCompleted ? 25 : -25;
    update({ goals: newGoals, warriorCodePoints: Math.max(0, data.warriorCodePoints + xpReward) });
  };

  const deleteGoal = (id: string) => {
    update({ goals: data.goals.filter(g => g.id !== id) });
  };

  const addMilestone = (goalId: string) => {
    const text = milestoneInputs[goalId];
    if (!text?.trim()) return;
    const newMilestone: Milestone = { id: Date.now().toString(), text: text, progress: 0 };
    const newGoals = data.goals.map(g => {
      if (g.id === goalId) return { ...g, milestones: [...(g.milestones || []), newMilestone] };
      return g;
    });
    update({ goals: newGoals });
    setMilestoneInputs(prev => ({ ...prev, [goalId]: '' }));
  };

  const updateMilestoneProgress = (goalId: string, milestoneId: string, newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    let xpChange = 0;
    let celebrateText = '';
    const newGoals = data.goals.map(g => {
      if (g.id === goalId) {
        const newMilestones = g.milestones.map(m => {
          if (m.id === milestoneId) {
             if (m.progress < 100 && clampedProgress === 100) { celebrateText = m.text; xpChange = 50; }
             else if (m.progress === 100 && clampedProgress < 100) { xpChange = -50; }
             return { ...m, progress: clampedProgress };
          }
          return m;
        });
        return { ...g, milestones: newMilestones };
      }
      return g;
    });
    update({ goals: newGoals, warriorCodePoints: Math.max(0, data.warriorCodePoints + xpChange) });
    if (celebrateText) triggerCelebrationEffect(celebrateText);
  };

  const deleteMilestone = (goalId: string, milestoneId: string) => {
    const newGoals = data.goals.map(g => {
      if (g.id === goalId) return { ...g, milestones: g.milestones.filter(m => m.id !== milestoneId) };
      return g;
    });
    update({ goals: newGoals });
  };

  const triggerCelebrationEffect = (milestoneText: string) => {
    const randomMsg = COACH_PHRASES.complete[Math.floor(Math.random() * COACH_PHRASES.complete.length)];
    setCelebration({ show: true, text: `MILESTONE SECURED: "${milestoneText}"`, coachMsg: randomMsg });
    setTimeout(() => setCelebration({ show: false, text: '' }), 4000);
  };

  const filteredGoals = data.goals.filter(g => g.category === activeCategory);
  const weeklyGoals = data.goals.filter(g => g.category === 'Weekly');
  const weeklyCompleted = weeklyGoals.filter(g => g.completed).length;
  const weeklyProgress = weeklyGoals.length > 0 ? (weeklyCompleted / weeklyGoals.length) * 100 : 0;

  return (
    <div className="space-y-12 md:space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 relative">
      
      {celebration.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/95 backdrop-blur-xl animate-bounce">
           <div className="text-center">
              <Trophy size={80} className="text-[#f78121] mx-auto mb-6 drop-shadow-lg" />
              <h2 className="text-2xl md:text-4xl font-black font-brand-header uppercase tracking-wider text-white mb-2">{celebration.text}</h2>
              <p className="text-base md:text-lg text-[#45d0d0] font-bold italic">"{celebration.coachMsg}"</p>
           </div>
        </div>
      )}

      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-white/20 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">Strategic Execution</h3>
              <p className="text-base text-white/70 font-medium leading-relaxed italic">
                "A goal without a timeline is just a dream. A timeline without milestones is just a wish. Build the roadmap, then walk it."
              </p>
           </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Your Goals</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Goal Tracking</p>
      </header>

      {/* Timeline Visualizer */}
      <section className="glass-card p-6 md:p-8 mb-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
         <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-2">
               <Calendar size={16} className="text-[#f78121]" /> Tactical Horizon
            </h3>
            <span className="text-[10px] font-bold text-[#45d0d0] uppercase tracking-widest">{activeCategory} View</span>
         </div>
         <div className="relative h-2 bg-white/10 rounded-full mb-8">
            <div 
              className="absolute top-0 left-0 h-full bg-[#f78121] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(247,129,33,0.5)]" 
              style={{ width: TIMELINE_CONFIG[activeCategory].width }} 
            />
            {Object.keys(TIMELINE_CONFIG).map((cat, idx) => (
               <div key={cat} className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-[#001b3d] border-2 border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-125 cursor-pointer z-10" style={{ left: TIMELINE_CONFIG[cat as Goal['category']].width }}>
                  <div className={`w-1.5 h-1.5 rounded-full ${activeCategory === cat ? 'bg-[#f78121]' : 'bg-transparent'}`} />
               </div>
            ))}
         </div>
         <div className="flex bg-[#eef1f1] p-1 rounded-xl gap-1">
            {CATEGORIES.map(cat => (
               <button 
                 key={cat} 
                 onClick={() => setActiveCategory(cat)}
                 className={`flex-1 py-3 text-[10px] md:text-xs font-black uppercase tracking-widest rounded-lg transition-all ${activeCategory === cat ? 'bg-[#f78121] text-white shadow-md' : 'text-[#595b61] hover:bg-white/50'}`}
               >
                 {cat === 'Big Vision' ? 'Vision' : cat}
               </button>
            ))}
         </div>
      </section>

      {/* Goal Input */}
      <div className="glass-card p-6 md:p-8 mb-8 flex gap-3 transition-all duration-300 ease-in-out hover:-translate-y-1">
         <input 
           value={newGoalText}
           onChange={(e) => setNewGoalText(e.target.value)}
           onKeyDown={(e) => e.key === 'Enter' && addGoal()}
           placeholder={`Set new ${activeCategory} objective...`}
           className="flex-1 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-3 text-sm text-[#595b61] font-bold focus:border-[#f78121] outline-none placeholder:text-[#595b61]/70"
         />
         <button onClick={addGoal} disabled={!newGoalText.trim()} className="bg-[#f78121] text-white p-3 rounded-xl disabled:opacity-50 hover:bg-orange-600 transition-all shadow-lg active:scale-95">
            <Plus size={20} />
         </button>
      </div>

      {/* Goals List */}
      <div className="space-y-6">
         {filteredGoals.length === 0 && (
            <div className="text-center py-16 opacity-40 italic flex flex-col items-center">
               <Target size={48} className="mb-4 text-white" />
               <p className="text-xs font-black uppercase tracking-widest text-white">No objectives set in this sector.</p>
            </div>
         )}

         {filteredGoals.map(goal => (
            <div key={goal.id} className={`glass-card p-6 md:p-8 transition-all duration-500 ease-in-out hover:-translate-y-1 ${goal.completed ? 'border-[#f78121] bg-[#f78121]/5' : ''}`}>
               <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-4">
                     <button onClick={() => toggleGoal(goal.id)} className={`mt-1 transition-all ${goal.completed ? 'text-[#f78121] scale-110' : 'text-white/20 hover:text-[#f78121]'}`}>
                        {goal.completed ? <CheckCircle2 size={28} /> : <Circle size={28} />}
                     </button>
                     <div>
                        <h4 className={`text-base md:text-xl font-bold ${goal.completed ? 'text-[#f78121] line-through decoration-2' : 'text-white'}`}>{goal.text}</h4>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0] bg-[#45d0d0]/10 px-2 py-0.5 rounded">{goal.category}</span>
                           {goal.completed && <span className="text-[10px] font-black uppercase tracking-widest text-[#f78121] flex items-center gap-1"><Trophy size={10} /> Secured</span>}
                        </div>
                     </div>
                  </div>
                  <button onClick={() => deleteGoal(goal.id)} className="text-white/20 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
               </div>

               {/* Milestones */}
               <div className="pl-11 space-y-3">
                  {goal.milestones?.map(ms => (
                     <div key={ms.id} className="bg-black/20 rounded-lg p-3 border border-white/5">
                        <div className="flex justify-between items-center mb-2">
                           <span className="text-xs font-bold text-white/80">{ms.text}</span>
                           <button onClick={() => deleteMilestone(goal.id, ms.id)} className="text-white/20 hover:text-red-400"><X size={12} /></button>
                        </div>
                        <div className="flex items-center gap-3">
                           <input 
                             type="range" 
                             min="0" max="100" 
                             value={ms.progress} 
                             onChange={(e) => updateMilestoneProgress(goal.id, ms.id, parseInt(e.target.value))}
                             className="flex-1 h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-[#f78121] [&::-webkit-slider-thumb]:rounded-full"
                           />
                           <span className="text-[10px] font-black text-[#f78121] w-8 text-right">{ms.progress}%</span>
                        </div>
                     </div>
                  ))}
                  
                  <div className="flex gap-2 mt-4">
                     <input 
                       value={milestoneInputs[goal.id] || ''}
                       onChange={(e) => setMilestoneInputs({...milestoneInputs, [goal.id]: e.target.value})}
                       onKeyDown={(e) => e.key === 'Enter' && addMilestone(goal.id)}
                       placeholder="Add tactical milestone..."
                       className="flex-1 bg-transparent border-b border-white/20 text-xs text-white p-2 focus:border-[#f78121] outline-none transition-colors placeholder:text-white/30"
                     />
                     <button onClick={() => addMilestone(goal.id)} className="text-[#f78121] hover:text-white transition-colors"><Plus size={16} /></button>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default GoalMaster;
