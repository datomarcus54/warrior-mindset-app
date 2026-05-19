
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { UserData, HealthMetrics, MealAnalysis, MealType, WorkoutCategory, WorkoutSession, DailyHealthLog } from '../types';
import {
  Activity, Moon, Clock, Droplet, Camera, Plus, Trash2,
  Flame, Wind, Dumbbell, Move, Calendar as CalendarIcon,
  ChevronLeft, ChevronRight, Scale, Info, X, Zap, Pill, BarChart2, Save
} from 'lucide-react';
import { analyzeMealImage, estimateMealFromDescription } from '../services/gemini';
import EmptyState from './EmptyState';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
  isGuest: boolean;
  onRestricted: () => void;
}

const AgelessLiving: React.FC<Props> = ({ data, update, isGuest, onRestricted }) => {
  const [activeTab, setActiveTab] = useState<'Movement' | 'Nutrition' | 'Fasting' | 'Sleep' | 'Settings'>('Movement');
  const [showLesson, setShowLesson] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory | null>(null);
  const [workoutMins, setWorkoutMins] = useState<string>('');
  const [workoutCals, setWorkoutCals] = useState<string>('');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date().toLocaleDateString('en-CA'));
  const [isMounted, setIsMounted] = useState(false);
  
  const [newMedicine, setNewMedicine] = useState('');
  const [showManualMeal, setShowManualMeal] = useState(false);
  const [manualDesc, setManualDesc] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [mealType, setMealType] = useState<MealType>(() => {
    const h = new Date().getHours();
    if (h < 10) return 'Breakfast';
    if (h < 14) return 'Lunch';
    if (h < 19) return 'Dinner';
    return 'Supper';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => setIsMounted(true), 500);
  }, []);

  // Daily reset — called directly (not via updateMetric) so it doesn't write
  // false sleepScore: 0 entries into dailyLogs.
  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA');
    if (!isGuest && data.health.healthDate !== today) {
      const newHealth: HealthMetrics = {
        ...data.health,
        healthDate: today,
        waterIntakeMl: 0,
        vo2MaxToday: false,
        strengthToday: false,
        stabilityToday: false,
        rpeToday: 0,
        timeAsleepHours: 0,
        timeAsleepMinutes: 0,
        timeInBedHours: 0,
        timeInBedMinutes: 0,
        deepSleepHours: 0,
        deepSleepMinutes: 0,
        remSleepHours: 0,
        remSleepMinutes: 0,
        sleepScore: 0,
        supplementLogsToday: {},
        fastingStart: null,
        lastUpdated: new Date().toISOString(),
      };
      update({ health: newHealth });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const SLEEP_LOG_KEYS = [
    'sleepScore', 'timeAsleepHours', 'timeAsleepMinutes',
    'timeInBedHours', 'timeInBedMinutes',
    'deepSleepHours', 'deepSleepMinutes',
    'remSleepHours', 'remSleepMinutes',
  ] as const;

  const updateMetric = (updates: Partial<HealthMetrics>) => {
    if (isGuest) return;
    const newHealth = { ...data.health, ...updates };
    newHealth.lastUpdated = new Date().toISOString();
    // Write any sleep fields into today's dailyLog so they survive the daily reset.
    const sleepDelta: Record<string, number> = {};
    for (const k of SLEEP_LOG_KEYS) {
      if (k in updates) sleepDelta[k] = (updates as any)[k];
    }
    if (Object.keys(sleepDelta).length > 0) {
      const today = new Date().toLocaleDateString('en-CA');
      const logs = newHealth.dailyLogs || [];
      const logIndex = logs.findIndex(l => l.date === today);
      const base = logIndex >= 0 ? logs[logIndex] : { date: today, workouts: [], fastingHours: 0, fastingCompleted: false };
      const updatedLog = { ...base, ...sleepDelta };
      const newLogs = [...logs];
      if (logIndex >= 0) newLogs[logIndex] = updatedLog; else newLogs.unshift(updatedLog);
      newHealth.dailyLogs = newLogs;
    }
    update({ health: newHealth });
  };

  useEffect(() => {
    const timer = setInterval(() => {
      if (!data.health.fastingStart) { setTimeLeft('IDLE'); return; }
      const start = new Date(data.health.fastingStart).getTime();
      const durationMs = data.health.fastingWindowHours * 60 * 60 * 1000;
      const end = start + durationMs;
      const now = new Date().getTime();
      const diff = end - now;
      if (diff <= 0) { setTimeLeft('COMPLETE'); } 
      else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [data.health.fastingStart, data.health.fastingWindowHours]);

  const todayStr = new Date().toLocaleDateString('en-CA');
  const getTodayLog = (): DailyHealthLog => {
    const logs = data.health.dailyLogs || [];
    const found = logs.find(l => l.date === todayStr);
    if (found) return found;
    return { date: todayStr, workouts: [], fastingHours: 0, fastingCompleted: false };
  };

  const handleLogWorkout = () => {
    if (isGuest) { onRestricted(); return; }
    if (!selectedCategory || !workoutMins) return;
    const minutes = parseInt(workoutMins);
    const calories = selectedCategory === 'Stretching' ? 0 : (parseInt(workoutCals) || 0);
    if (selectedCategory !== 'Stretching' && !workoutCals) return;

    const newSession: WorkoutSession = { id: Date.now().toString(), category: selectedCategory, minutes, calories, timestamp: new Date().toISOString() };
    const currentLog = getTodayLog();
    const updatedLog = { ...currentLog, workouts: [newSession, ...currentLog.workouts] };
    const logs = data.health.dailyLogs || [];
    const otherLogs = logs.filter(l => l.date !== todayStr);
    let newZone2 = data.health.zone2MinutesWeekly;
    if (selectedCategory === 'Cardio') { newZone2 += minutes; }
    updateMetric({ dailyLogs: [updatedLog, ...otherLogs], zone2MinutesWeekly: newZone2 });
    update({ warriorCodePoints: data.warriorCodePoints + 15 });
    setWorkoutMins(''); setWorkoutCals(''); setSelectedCategory(null);
  };

  const handleCompleteFast = () => {
     if (isGuest) { onRestricted(); return; }
     const currentLog = getTodayLog();
     const updatedLog = { ...currentLog, fastingCompleted: true, fastingHours: data.health.fastingWindowHours };
     const logs = data.health.dailyLogs || [];
     const otherLogs = logs.filter(l => l.date !== todayStr);
     updateMetric({ dailyLogs: [updatedLog, ...otherLogs], fastingStart: null });
     update({ warriorCodePoints: data.warriorCodePoints + 20 });
  };

  const todayLog = getTodayLog();
  const todayTotalMins = todayLog.workouts.reduce((acc, curr) => acc + curr.minutes, 0);
  const todayTotalBurned = todayLog.workouts.reduce((acc, curr) => acc + curr.calories, 0);
  const todayMeals = data.health.mealLogs.filter(log => log.timestamp.startsWith(todayStr));
  const todayConsumedCals = todayMeals.reduce((acc, curr) => acc + curr.calories, 0);
  const todayTotalProtein = todayMeals.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const todayTotalCarbs   = todayMeals.reduce((acc, curr) => acc + (curr.carbs   || 0), 0);
  const todayTotalFats    = todayMeals.reduce((acc, curr) => acc + (curr.fats    || 0), 0);
  const netCalories = todayConsumedCals - todayTotalBurned;

  const isViewingToday = selectedDate === todayStr;
  const selectedLog = (data.health.dailyLogs || []).find(l => l.date === selectedDate);
  const selectedMeals = data.health.mealLogs.filter(log => log.timestamp.startsWith(selectedDate));
  const selectedConsumedCals = selectedMeals.reduce((acc, curr) => acc + curr.calories, 0);
  const selectedTotalProtein = selectedMeals.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const selectedTotalCarbs   = selectedMeals.reduce((acc, curr) => acc + (curr.carbs   || 0), 0);
  const selectedTotalFats    = selectedMeals.reduce((acc, curr) => acc + (curr.fats    || 0), 0);
  const selectedBurned = selectedLog?.workouts?.reduce((acc, curr) => acc + curr.calories, 0) || 0;
  const selectedNetCalories = selectedConsumedCals - selectedBurned;

  const getCategoryTotal = (cat: WorkoutCategory) => {
    const sessions = todayLog.workouts.filter(w => w.category === cat);
    return { mins: sessions.reduce((a, c) => a + c.minutes, 0), cals: sessions.reduce((a, c) => a + c.calories, 0) };
  };

  const hasData = (log: DailyHealthLog | undefined) => {
    if (!log) return false;
    if (activeTab === 'Movement') return log.workouts.length > 0;
    if (activeTab === 'Fasting') return log.fastingCompleted;
    if (activeTab === 'Sleep') return (log.sleepScore || 0) > 0;
    return false;
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay, year, month };
  };

  const calendarData = useMemo(() => {
    const { days, firstDay, year, month } = getDaysInMonth(currentMonthDate);
    const blanks = Array(firstDay).fill(null);
    const logs = data.health.dailyLogs || [];
    const dayArray = Array.from({ length: days }, (_, i) => {
      const dayNum = i + 1;
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const log = logs.find(l => l.date === dateStr);
      return { dayNum, dateStr, log };
    });
    return [...blanks, ...dayArray];
  }, [currentMonthDate, data.health.dailyLogs]);

  const changeMonth = (delta: number) => {
    const newDate = new Date(currentMonthDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setCurrentMonthDate(newDate);
  };

  const handleImageCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isGuest) { onRestricted(); return; }
    const file = e.target.files?.[0];
    if (!file) return;
    setIsAnalyzing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      const result = await analyzeMealImage(base64);
      if (result) {
        const newMeal: MealAnalysis = { timestamp: new Date().toISOString(), calories: result.calories || 0, protein: result.protein || 0, carbs: result.carbs || 0, fats: result.fats || 0, description: result.description || 'Warrior Fuel', mealType };
        updateMetric({ mealLogs: [newMeal, ...data.health.mealLogs] });
        update({ warriorCodePoints: data.warriorCodePoints + 20 });
      }
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleManualMealLog = async () => {
    if (isGuest) { onRestricted(); return; }
    if (!manualDesc.trim()) return;
    setIsEstimating(true);
    const result = await estimateMealFromDescription(manualDesc.trim());
    setIsEstimating(false);
    const newMeal: MealAnalysis = {
      timestamp: new Date().toISOString(),
      calories: result?.calories || 0,
      protein: result?.protein || 0,
      carbs: result?.carbs || 0,
      fats: result?.fats || 0,
      description: result?.description || manualDesc.trim(),
      mealType,
    };
    updateMetric({ mealLogs: [newMeal, ...data.health.mealLogs] });
    update({ warriorCodePoints: data.warriorCodePoints + 10 });
    setManualDesc('');
    setShowManualMeal(false);
  };

  const lastUpdatedFormatted = useMemo(() => {
    const date = new Date(data.health.lastUpdated || new Date());
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }, [data.health.lastUpdated]);

  const sleepTrendData = useMemo(() => {
    return (data.health.dailyLogs || [])
        .filter(l => (l.sleepScore ?? 0) > 0)
        .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14)
        .map(l => ({ date: l.date.slice(5), score: l.sleepScore }));
  }, [data.health.dailyLogs]);

  return (
    <div className="space-y-8 md:space-y-12 pb-32">
      
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border-4 border-[#001b3d] rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <div className="mb-6">
                <div className="w-12 h-12 bg-[#f78121]/10 rounded-full flex items-center justify-center border border-[#f78121]/30">
                  <Info size={24} className="text-[#f78121]" />
                </div>
              </div>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">The Warrior Body</h3>
              <p className="text-base text-white font-medium leading-relaxed italic">
                "Peak physical utility and biological longevity are the foundation of your mental fortress. Condition yourself for the long term."
              </p>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8">
        <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Body & Energy</h2>
              <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white transition-colors" aria-label="Warrior Lesson">
                <Info size={24} />
              </button>
            </div>
            <div className="flex items-center space-x-2 text-[#45d0d0] mt-1">
               <CalendarIcon size={12} className="md:w-4 md:h-4" />
               <p className="text-[10px] md:text-xs font-black uppercase tracking-widest">Last Updated: {lastUpdatedFormatted}</p>
            </div>
            <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Daily Care</p>
        </div>
        {!isGuest && (
          <button
            onClick={() => updateMetric({})}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#f78121] text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white hover:text-[#0A3762] transition-all self-start"
          >
            <Save size={14} />
            Save Ageless
          </button>
        )}
      </header>

      {/* Sub-Nav Tabs */}
      <div className="flex bg-[#eef1f1] rounded-2xl p-1 gap-1 w-full overflow-x-auto no-scrollbar border border-white shadow-sm">
           {['Movement', 'Nutrition', 'Fasting', 'Sleep', 'Settings'].map((t) => (
             <button key={t} onClick={() => setActiveTab(t as any)} className={`px-4 py-3 md:px-6 md:py-4 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap flex-1 ${activeTab === t ? 'bg-[#f78121] text-white shadow-md' : 'text-[#595b61] hover:text-[#001b3d] hover:bg-white/50'}`}>
               {t}
             </button>
           ))}
      </div>

      {/* --- MOVEMENT TAB --- */}
      {activeTab === 'Movement' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
          <section className="glass-card p-6 md:p-8 flex justify-between items-center relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1">
             <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><Activity size={120} /></div>
             <div className="relative z-10 flex-1 text-center border-r border-white/20">
                <div className="text-xs md:text-sm text-white font-black uppercase tracking-widest mb-1">Active Time</div>
                <div className="text-4xl md:text-6xl font-black text-[#0A3762] font-brand-header">{todayTotalMins}<span className="text-sm md:text-xl text-white/50 ml-1">min</span></div>
             </div>
             <div className="relative z-10 flex-1 text-center">
                <div className="text-xs md:text-sm text-white font-black uppercase tracking-widest mb-1">Calories Burned</div>
                <div className="text-4xl md:text-6xl font-black text-[#f78121] font-brand-header">{todayTotalBurned}<span className="text-sm md:text-xl text-white/50 ml-1">kcal</span></div>
             </div>
          </section>

          <div className="grid grid-cols-2 gap-4 md:gap-6">
             {[
               { id: 'Cardio', icon: Wind, color: 'text-sky-500', label: 'Cardio' },
               { id: 'HIIT', icon: Flame, color: 'text-[#f78121]', label: 'HIIT' },
               { id: 'Resistance', icon: Dumbbell, color: 'text-[#45d0d0]', label: 'Resistance' },
               { id: 'Stretching', icon: Move, color: 'text-indigo-500', label: 'Stretching' }
             ].map((cat) => {
               const totals = getCategoryTotal(cat.id as WorkoutCategory);
               return (
                 <button key={cat.id} onClick={() => setSelectedCategory(cat.id as WorkoutCategory)} className={`glass-card p-6 flex flex-col items-center justify-center transition-all duration-300 border-2 ${selectedCategory === cat.id ? 'border-[#f78121] bg-white/5' : 'border-white/10 hover:border-[#f78121]/30'}`}>
                    <cat.icon size={32} className={`${cat.color} mb-3`} />
                    <span className="text-xs md:text-sm font-black uppercase tracking-widest text-white mb-2">{cat.label}</span>
                    <div className="flex space-x-3 text-[10px] text-white/70 font-bold">
                      <span>{totals.mins} m</span>
                      {cat.id !== 'Stretching' && <span>{totals.cals} cal</span>}
                    </div>
                 </button>
               )
             })}
          </div>

          {selectedCategory && (
            <section className="glass-card p-6 md:p-8 animate-in fade-in slide-in-from-top-4 border-2 border-[#f78121]">
               <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg md:text-xl font-black uppercase tracking-tight text-[#f78121]">Log {selectedCategory} Session</h3>
                  <button onClick={() => setSelectedCategory(null)}><Trash2 size={20} className="text-white/50 hover:text-red-500" /></button>
               </div>
               <div className="flex space-x-4 mb-6">
                  <div className="flex-1">
                     <label className="text-[10px] uppercase font-black tracking-widest text-[#f78121] mb-2 block">Duration (Min)</label>
                     <input type="number" value={workoutMins} onChange={(e) => setWorkoutMins(e.target.value)} placeholder="0" className="w-full bg-[#eef1f1] border border-[#45d0d0]/30 rounded-xl p-4 text-xl font-bold text-center text-[#595b61] focus:border-[#f78121]" />
                  </div>
                  {selectedCategory !== 'Stretching' && (
                    <div className="flex-1">
                       <label className="text-[10px] uppercase font-black tracking-widest text-[#f78121] mb-2 block">Est. Calories</label>
                       <input type="number" value={workoutCals} onChange={(e) => setWorkoutCals(e.target.value)} placeholder="0" className="w-full bg-[#eef1f1] border border-[#45d0d0]/30 rounded-xl p-4 text-xl font-bold text-center text-[#595b61] focus:border-[#f78121]" />
                    </div>
                  )}
               </div>
               <button onClick={handleLogWorkout} className="w-full py-5 bg-[#f78121] text-white rounded-xl font-black uppercase tracking-[0.2em] shadow-lg active:scale-[0.98] hover:bg-orange-600 transition-all">Record Kinetic Data</button>
            </section>
          )}
        </div>
      )}

      {/* --- NUTRITION TAB --- */}
      {activeTab === 'Nutrition' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
           <section className="glass-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
              <header className="flex items-center space-x-3 mb-6">
                 <div className="p-3 bg-[#f78121]/10 rounded-xl"><Scale className="text-[#f78121]" size={20} /></div>
                 <h3 className="text-lg font-black uppercase tracking-widest text-white">Fuel Balance</h3>
              </header>
              {!isViewingToday && (
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs font-black uppercase tracking-widest text-white/50">{selectedDate}</p>
                  <button onClick={() => setSelectedDate(todayStr)} className="text-xs font-black uppercase tracking-widest text-[#f78121] border border-[#f78121]/30 px-3 py-1 rounded-lg hover:bg-[#f78121]/10 transition-all">Back to Today</button>
                </div>
              )}
              <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-0 text-center mb-8">
                 <div className="flex-1">
                    <div className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">Intake</div>
                    <div className="text-3xl font-black text-[#45d0d0]">{selectedConsumedCals} <span className="text-sm text-white/50">kcal</span></div>
                 </div>
                 <div className="text-white/50 font-bold text-xl hidden md:block">-</div>
                 <div className="flex-1">
                    <div className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">Output</div>
                    <div className="text-3xl font-black text-[#f78121]">{selectedBurned} <span className="text-sm text-white/50">kcal</span></div>
                 </div>
                 <div className="text-white/50 font-bold text-xl hidden md:block">=</div>
                 <div className="flex-1 bg-black/20 py-4 rounded-xl w-full md:w-auto border border-white/10">
                    <div className="text-xs text-white/70 font-black uppercase tracking-widest mb-1">Net Load</div>
                    <div className={`text-4xl font-black ${selectedNetCalories > 0 ? 'text-white' : 'text-blue-400'}`}>{selectedNetCalories} <span className="text-sm text-white/50">kcal</span></div>
                 </div>
              </div>
           </section>

           <section className="glass-card p-6 md:p-8 flex items-center justify-between transition-all duration-300 ease-in-out hover:-translate-y-1">
              <div className="flex items-center space-x-4">
                 <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/30">
                    <Droplet size={24} className="text-blue-400" />
                 </div>
                 <div>
                    <div className="text-2xl font-black text-white">{data.health.waterIntakeMl} / 2500 ml</div>
                 </div>
              </div>
              <button onClick={() => updateMetric({ waterIntakeMl: data.health.waterIntakeMl + 250 })} className="px-6 py-3 bg-blue-600 text-white font-black text-sm uppercase rounded-xl active:scale-95 shadow-lg">+250ml</button>
           </section>

           {/* Meal Type Selector */}
           <section className="glass-card p-5 transition-all duration-300 ease-in-out hover:-translate-y-1">
             <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-3">Meal Type</div>
             <div className="flex gap-2 flex-wrap">
               {(['Breakfast', 'Lunch', 'Dinner', 'Supper'] as const).map(t => (
                 <button
                   key={t}
                   onClick={() => setMealType(t)}
                   className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${mealType === t ? 'bg-[#f78121] text-white shadow-md' : 'bg-white/10 text-white/50 hover:text-white'}`}
                 >
                   {t}
                 </button>
               ))}
             </div>
           </section>

           {/* Manual Meal Log */}
           <section className="glass-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
             <button
               onClick={() => { if (isGuest) { onRestricted(); return; } setShowManualMeal(p => !p); }}
               className="w-full flex items-center justify-between"
             >
               <div className="flex items-center gap-3">
                 <div className="p-2 bg-[#45d0d0]/10 rounded-xl border border-[#45d0d0]/30">
                   <Plus size={18} className="text-[#45d0d0]" />
                 </div>
                 <span className="text-sm font-black uppercase tracking-widest text-white">Log Meal Manually</span>
               </div>
               <span className="text-white/40 text-xs font-black">{showManualMeal ? '▲' : '▼'}</span>
             </button>
             {showManualMeal && (
               <div className="mt-6 space-y-4">
                 <input
                   type="text"
                   value={manualDesc}
                   onChange={(e) => setManualDesc(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleManualMealLog()}
                   placeholder="Describe the meal (e.g. Chicken rice bowl with vegetables)"
                   className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-4 py-3 text-sm text-[#595b61] font-bold focus:border-[#f78121] outline-none placeholder:text-[#595b61]/70"
                 />
                 <button
                   onClick={handleManualMealLog}
                   disabled={!manualDesc.trim() || isEstimating}
                   className="w-full py-4 bg-[#45d0d0] text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-[#3ababa] transition-all disabled:opacity-50 active:scale-[0.98]"
                 >
                   {isEstimating ? 'Analysing Nutrition...' : 'Analyse & Log'}
                 </button>
               </div>
             )}
           </section>

           <label
             className={`w-full glass-card p-6 md:p-8 border-2 border-[#f78121]/40 hover:border-[#f78121] transition-all duration-300 flex flex-col items-center justify-center gap-3 group cursor-pointer${isAnalyzing ? ' opacity-60 pointer-events-none' : ''}`}
           >
             <input
               type="file"
               accept="image/*"
               className="hidden"
               ref={fileInputRef}
               onChange={handleImageCapture}
               disabled={isAnalyzing}
             />
             <div className="p-4 bg-[#f78121]/10 rounded-full border border-[#f78121]/30 group-hover:bg-[#f78121]/20 transition-colors">
               <Camera size={28} className="text-[#f78121]" />
             </div>
             {isAnalyzing ? (
               <span className="text-sm font-black uppercase tracking-widest text-white animate-pulse">Scanning Bio-Data...</span>
             ) : (
               <>
                 <span className="text-sm font-black uppercase tracking-widest text-white">Log a Meal</span>
                 <span className="text-xs text-white/50 font-bold">Take or upload a photo — AI analyses the nutrition</span>
               </>
             )}
           </label>

           {/* Meal Cards + Daily Totals */}
           <section className="glass-card p-6 md:p-8 transition-all duration-300 ease-in-out hover:-translate-y-1">
              <h3 className="text-lg font-black uppercase tracking-widest text-white mb-6">Nutrition Summary</h3>
              {selectedMeals.length === 0 ? (
                isViewingToday ? (
                  <EmptyState
                    heading="No Meals Logged Today"
                    message="Fuel your body with intention. Log your first meal to begin tracking your nutrition."
                    buttonLabel="Log Your First Meal"
                    onButtonClick={() => setShowManualMeal(true)}
                  />
                ) : (
                  <EmptyState
                    heading="No Meals on This Day"
                    message="No meals were logged for this date."
                    buttonLabel="Back to Today"
                    onButtonClick={() => setSelectedDate(todayStr)}
                  />
                )
              ) : (
                <div className="space-y-4">
                  {selectedMeals.map((meal, i) => {
                    const timeStr = new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(meal.timestamp));
                    const typeColors: Record<string, string> = {
                      Breakfast: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
                      Lunch:     'bg-[#45d0d0]/20 text-[#45d0d0] border-[#45d0d0]/30',
                      Dinner:    'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
                      Supper:    'bg-purple-500/20 text-purple-400 border-purple-500/30',
                    };
                    const badgeClass = meal.mealType ? typeColors[meal.mealType] : 'bg-white/10 text-white/50 border-white/20';
                    return (
                      <div key={i} className="bg-black/20 border border-white/10 rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${badgeClass}`}>
                            {meal.mealType || 'Meal'}
                          </span>
                          <span className="text-[10px] text-white/40 font-bold">{isViewingToday ? 'Today' : selectedDate}, {timeStr}</span>
                        </div>
                        <div className="text-sm font-bold text-white mb-3">{meal.description}</div>
                        <div className="text-3xl font-black text-[#45d0d0] mb-4">
                          {meal.calories} <span className="text-sm font-bold text-white/40">kcal</span>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { label: 'Protein', val: meal.protein },
                            { label: 'Carbs',   val: meal.carbs },
                            { label: 'Fats',    val: meal.fats },
                          ].map(({ label, val }) => (
                            <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                              <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{label}</div>
                              <div className="text-base font-black text-white">{val}g</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Daily Totals */}
                  <div className="bg-[#f78121]/10 border border-[#f78121]/30 rounded-2xl p-5 mt-2">
                    <div className="text-xs font-black uppercase tracking-widest text-[#f78121] mb-3">{isViewingToday ? "Today's" : selectedDate} Totals</div>
                    <div className="text-3xl font-black text-white mb-4">
                      {selectedConsumedCals} <span className="text-sm font-bold text-white/40">kcal</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Protein', val: selectedTotalProtein },
                        { label: 'Carbs',   val: selectedTotalCarbs },
                        { label: 'Fats',    val: selectedTotalFats },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-white/5 rounded-xl p-3 text-center">
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{label}</div>
                          <div className="text-base font-black text-[#45d0d0]">{val}g</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
           </section>
        </div>
      )}

      {/* --- FASTING TAB --- */}
      {activeTab === 'Fasting' && (
         <div className="glass-card p-6 md:p-12 flex flex-col items-center justify-center text-center animate-in fade-in slide-in-from-right-4 transition-all duration-300 ease-in-out hover:-translate-y-1">
            <div className="relative mb-8">
               <div className="absolute inset-0 bg-[#f78121]/10 blur-xl rounded-full" />
               <Clock size={48} className="text-[#f78121] relative z-10" />
            </div>
            <h3 className="text-5xl md:text-7xl font-black text-[#f78121] font-brand-header tracking-tighter mb-4">{timeLeft || 'READY'}</h3>
            <p className="text-xs md:text-sm text-white font-black uppercase tracking-[0.2em] mb-8">Fasting Window: {data.health.fastingWindowHours} Hours</p>
            
            <div className="flex space-x-4 w-full max-w-md">
               {!data.health.fastingStart ? (
                  <button onClick={() => updateMetric({ fastingStart: new Date().toISOString() })} className="flex-1 py-5 bg-[#f78121] text-white rounded-xl font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">Initiate Fast</button>
               ) : (
                  <>
                    <button onClick={() => updateMetric({ fastingStart: null })} className="flex-1 py-5 bg-white/10 border border-white/20 text-white rounded-xl font-black uppercase tracking-widest hover:bg-white/20 transition-all">Abort</button>
                    {timeLeft === 'COMPLETE' && (
                      <button onClick={handleCompleteFast} className="flex-1 py-5 bg-[#45d0d0] text-white rounded-xl font-black uppercase tracking-widest shadow-lg animate-pulse">Log Success</button>
                    )}
                  </>
               )}
            </div>
         </div>
      )}

      {/* --- SLEEP TAB (Enhanced) --- */}
      {activeTab === 'Sleep' && (
        <section className="glass-card p-6 md:p-12 relative animate-in fade-in slide-in-from-right-4 transition-all duration-300 ease-in-out hover:-translate-y-1">
            <div className="flex items-center space-x-4 md:space-x-6 mb-8 md:mb-12">
                <div className="p-3 md:p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/30">
                    <Moon size={24} className="text-indigo-400 md:w-9 md:h-9" />
                </div>
                <div>
                    <h3 className="text-xl md:text-3xl font-black uppercase tracking-tight text-white">Recovery & Sleep</h3>
                    <p className="text-xs md:text-sm text-white/60 font-black uppercase tracking-widest">System Reboot & Consolidation</p>
                </div>
            </div>

            {isViewingToday ? (
              <>
                <div className="flex justify-center mb-10 md:mb-16">
                    <div className="relative w-40 h-40 md:w-56 md:h-56 flex items-center justify-center">
                        <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90 overflow-visible">
                            <circle cx="80" cy="80" r="70" stroke="#334155" strokeWidth="8" fill="transparent" />
                            <circle cx="80" cy="80" r="70" stroke="#6366F1" strokeWidth="8"
                                strokeDasharray={`${(data.health.sleepScore / 100) * 440} 440`}
                                strokeLinecap="round" fill="transparent" className="transition-all duration-1000" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <input
                                type="number"
                                value={data.health.sleepScore || ''}
                                onChange={(e) => updateMetric({ sleepScore: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                                placeholder="0"
                                className="text-5xl md:text-6xl font-black text-indigo-400 bg-transparent text-center w-24 md:w-36 outline-none font-brand-header"
                            />
                            <span className="text-[10px] md:text-xs text-white font-black uppercase tracking-widest mt-1 md:mt-2">Score</span>
                        </div>
                    </div>
                </div>

                {/* SAFE MOUNT CHART for Sleep Trends */}
                <div className="mb-12 bg-black/20 rounded-2xl p-4 border border-white/10">
                   <div className="flex items-center gap-2 mb-4">
                      <BarChart2 size={16} className="text-indigo-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Recovery Trend</span>
                   </div>
                   {isMounted && sleepTrendData.length === 0 ? (
                     <EmptyState
                       heading="No Sleep Data Yet"
                       message="Rest is your foundation for growth. Log your first night to begin tracking your recovery."
                       buttonLabel="Log Your Sleep"
                       onButtonClick={() => {}}
                     />
                   ) : (
                     <div style={{ width: '100%', height: '200px', minHeight: '200px' }}>
                       {isMounted && sleepTrendData.length > 0 ? (
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={sleepTrendData}>
                              <defs>
                                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                              <Area type="monotone" dataKey="score" stroke="#6366F1" fillOpacity={1} fill="url(#colorScore)" />
                              <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                            </AreaChart>
                          </ResponsiveContainer>
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs font-bold uppercase tracking-widest bg-white/5 rounded-xl">
                             Loading Chart...
                          </div>
                       )}
                     </div>
                   )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                    <div className="bg-black/20 rounded-2xl p-6 md:p-8 border border-white/10 shadow-sm">
                        <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6 text-white">
                            <Clock size={16} className="md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm font-black uppercase tracking-widest">Time In Bed</span>
                        </div>
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.timeInBedHours || ''} onChange={(e) => updateMetric({ timeInBedHours: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">HR</span>
                            </div>
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.timeInBedMinutes || ''} onChange={(e) => updateMetric({ timeInBedMinutes: parseInt(e.target.value) || 0 })} placeholder="0" className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">MIN</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-6 md:p-8 border border-white/10 shadow-sm">
                        <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6 text-indigo-400">
                            <Moon size={16} className="md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm font-black uppercase tracking-widest">Actual Sleep</span>
                        </div>
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.timeAsleepHours || ''} onChange={(e) => updateMetric({ timeAsleepHours: parseInt(e.target.value) || 0 })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">HR</span>
                            </div>
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.timeAsleepMinutes || ''} onChange={(e) => updateMetric({ timeAsleepMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">MIN</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-6 md:p-8 border border-white/10 shadow-sm">
                        <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6 text-indigo-300">
                            <Zap size={16} className="md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm font-black uppercase tracking-widest">Deep Sleep</span>
                        </div>
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.deepSleepHours || ''} onChange={(e) => updateMetric({ deepSleepHours: parseInt(e.target.value) || 0 })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">HR</span>
                            </div>
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.deepSleepMinutes || ''} onChange={(e) => updateMetric({ deepSleepMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">MIN</span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-black/20 rounded-2xl p-6 md:p-8 border border-white/10 shadow-sm">
                        <div className="flex items-center space-x-2 md:space-x-3 mb-4 md:mb-6 text-sky-400">
                            <Activity size={16} className="md:w-5 md:h-5" />
                            <span className="text-xs md:text-sm font-black uppercase tracking-widest">REM Sleep</span>
                        </div>
                        <div className="flex items-center space-x-3 md:space-x-4">
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.remSleepHours || ''} onChange={(e) => updateMetric({ remSleepHours: parseInt(e.target.value) || 0 })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">HR</span>
                            </div>
                            <div className="flex-1 relative">
                                <input type="number" value={data.health.remSleepMinutes || ''} onChange={(e) => updateMetric({ remSleepMinutes: parseInt(e.target.value) || 0 })} className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-3 md:p-4 text-center font-bold text-lg md:text-xl focus:border-indigo-400 text-[#595b61]" />
                                <span className="absolute right-2 md:right-3 top-3 md:top-4 text-[10px] md:text-xs text-[#595b61] font-black">MIN</span>
                            </div>
                        </div>
                    </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-xs font-black uppercase tracking-widest text-white/50">{selectedDate}</p>
                  <button onClick={() => setSelectedDate(todayStr)} className="text-xs font-black uppercase tracking-widest text-[#f78121] border border-[#f78121]/30 px-3 py-1.5 rounded-lg hover:bg-[#f78121]/10 transition-all">Back to Today</button>
                </div>

                {selectedLog && (selectedLog.sleepScore || 0) > 0 ? (
                  <div className="space-y-4 mb-8">
                    <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-2xl p-6 text-center">
                      <div className="text-6xl font-black text-indigo-400 mb-1">{selectedLog.sleepScore}</div>
                      <div className="text-xs font-black uppercase tracking-widest text-white/50">Sleep Score</div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Time In Bed',  h: selectedLog.timeInBedHours  || 0, m: selectedLog.timeInBedMinutes  || 0 },
                        { label: 'Actual Sleep', h: selectedLog.timeAsleepHours || 0, m: selectedLog.timeAsleepMinutes || 0 },
                        { label: 'Deep Sleep',   h: selectedLog.deepSleepHours  || 0, m: selectedLog.deepSleepMinutes  || 0 },
                        { label: 'REM Sleep',    h: selectedLog.remSleepHours   || 0, m: selectedLog.remSleepMinutes   || 0 },
                      ].map(({ label, h, m }) => (
                        <div key={label} className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
                          <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">{label}</div>
                          <div className="text-xl font-black text-white">{h}h {m}m</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-8">
                    <EmptyState
                      heading="No Sleep Data Yet"
                      message="Rest is your foundation for growth. Log your first night to begin tracking your recovery."
                      buttonLabel="Log Your Sleep"
                      onButtonClick={() => setSelectedDate(todayStr)}
                    />
                  </div>
                )}

                {isMounted && sleepTrendData.length > 0 && (
                  <div className="bg-black/20 rounded-2xl p-4 border border-white/10">
                    <div className="flex items-center gap-2 mb-4">
                      <BarChart2 size={16} className="text-indigo-400" />
                      <span className="text-xs font-black uppercase tracking-widest text-indigo-400">Recovery Trend</span>
                    </div>
                    <div style={{ width: '100%', height: '200px', minHeight: '200px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sleepTrendData}>
                          <defs>
                            <linearGradient id="colorScore2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }} />
                          <Area type="monotone" dataKey="score" stroke="#6366F1" fillOpacity={1} fill="url(#colorScore2)" />
                          <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </>
            )}
        </section>
      )}

      {/* --- SETTINGS TAB --- */}
      {activeTab === 'Settings' && (
        <section className="glass-card p-6 md:p-12 animate-in fade-in zoom-in-95 transition-all duration-300 ease-in-out hover:-translate-y-1">
          {/* Supplements */}
          <div className="mb-10">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-6">Supplements Stack</h3>
            <div className="flex space-x-3 md:space-x-5 mb-6">
              <input id="supInput" type="text" placeholder="Compound Name..." className="flex-1 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-2xl px-6 md:px-8 py-4 md:py-6 text-base focus:border-[#f78121] outline-none text-[#595b61]" />
              <button onClick={() => {
                if (isGuest) { onRestricted(); return; }
                const input = document.getElementById('supInput') as HTMLInputElement;
                if(input.value) {
                  updateMetric({ supplementsList: [...data.health.supplementsList, input.value] });
                  input.value = '';
                }
              }} className="p-4 md:p-6 bg-[#f78121] text-white rounded-2xl shadow-lg"><Plus size={24} className="md:w-7 md:h-7" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {data.health.supplementsList.map(sup => (
                <div key={sup} className="flex items-center justify-between p-4 md:p-6 bg-black/20 border border-white/10 rounded-2xl shadow-sm">
                  <span className="text-sm md:text-base font-bold text-white">{sup}</span>
                  <button onClick={() => {
                      if (isGuest) { onRestricted(); return; }
                      updateMetric({ supplementsList: data.health.supplementsList.filter(s => s !== sup) })
                  }} className="text-white/50 hover:text-[#f78121] transition-colors"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Medicines (New) */}
          <div>
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-6 flex items-center"><Pill className="mr-3" /> Medicines</h3>
            <div className="flex space-x-3 md:space-x-5 mb-6">
              <input 
                value={newMedicine}
                onChange={(e) => setNewMedicine(e.target.value)}
                type="text" 
                placeholder="Medication Name..." 
                className="flex-1 bg-[#eef1f1] border border-[#45d0d0]/20 rounded-2xl px-6 md:px-8 py-4 md:py-6 text-base focus:border-[#45d0d0] outline-none text-[#595b61]" 
              />
              <button onClick={() => {
                if (isGuest) { onRestricted(); return; }
                if(newMedicine) {
                  updateMetric({ medicines: [...(data.health.medicines || []), newMedicine] });
                  setNewMedicine('');
                }
              }} className="p-4 md:p-6 bg-[#45d0d0] text-white rounded-2xl shadow-lg"><Plus size={24} className="md:w-7 md:h-7" /></button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {(data.health.medicines || []).map((med, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 md:p-6 bg-black/20 border border-white/10 rounded-2xl shadow-sm">
                  <span className="text-sm md:text-base font-bold text-white">{med}</span>
                  <button onClick={() => updateMetric({ medicines: (data.health.medicines || []).filter((_, i) => i !== idx) })} className="text-white/50 hover:text-[#f78121] transition-colors"><Trash2 size={20} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* Body Composition */}
          <div className="mt-10 pt-10 border-t border-white/10">
            <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter text-white mb-8 flex items-center gap-3">
              <Scale size={22} className="text-[#f78121]" /> Body Composition
            </h3>
            {(() => {
              const wKg = data.health.weightKg || 0;
              const hCm = data.health.heightCm || 0;
              const bfp = data.health.bodyFatPercent || 0;
              const unit = data.health.weightUnit || 'kg';
              const toDisplay = (kg: number) => unit === 'lbs' ? +(kg * 2.20462).toFixed(1) : +kg.toFixed(1);
              const fatMassKg = +(wKg * bfp / 100).toFixed(1);
              const leanMassKg = +(wKg - fatMassKg).toFixed(1);
              const bmi = hCm > 0 ? +(wKg / Math.pow(hCm / 100, 2)).toFixed(1) : 0;
              const bmiCat = bmi === 0 ? '—' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese';
              const bmiColor = bmi === 0 ? 'text-white/40' : bmi < 18.5 ? 'text-blue-400' : bmi < 25 ? 'text-[#45d0d0]' : bmi < 30 ? 'text-yellow-400' : 'text-[#f78121]';
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {[
                      { label: 'Age (yrs)', value: data.health.age || '', onChange: (v: string) => updateMetric({ age: parseInt(v) || 0 }), placeholder: '0' },
                      { label: 'Height (cm)', value: data.health.heightCm || '', onChange: (v: string) => updateMetric({ heightCm: parseInt(v) || 0 }), placeholder: '0' },
                      { label: `Weight (${unit})`, value: unit === 'kg' ? (data.health.weightKg || '') : (data.health.weightKg ? toDisplay(data.health.weightKg) : ''), onChange: (v: string) => updateMetric({ weightKg: unit === 'kg' ? (parseFloat(v) || 0) : +((parseFloat(v) || 0) / 2.20462).toFixed(2) }), placeholder: '0' },
                      { label: 'Body Fat %', value: data.health.bodyFatPercent || '', onChange: (v: string) => updateMetric({ bodyFatPercent: parseFloat(v) || 0 }), placeholder: '0' },
                    ].map(({ label, value, onChange, placeholder }) => (
                      <div key={label}>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0] block mb-2">{label}</label>
                        <input
                          type="number"
                          value={value}
                          onChange={(e) => onChange(e.target.value)}
                          placeholder={placeholder}
                          className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl px-3 py-3 text-base text-center text-[#595b61] font-bold focus:border-[#f78121] outline-none"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => updateMetric({ weightUnit: unit === 'kg' ? 'lbs' : 'kg' })}
                    className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0] border border-[#45d0d0]/30 px-4 py-2 rounded-lg hover:bg-[#45d0d0]/10 transition-colors"
                  >
                    Switch to {unit === 'kg' ? 'lbs' : 'kg'}
                  </button>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
                    {[
                      { label: 'Fat Mass', value: wKg > 0 ? `${toDisplay(fatMassKg)} ${unit}` : '—', color: 'text-[#f78121]' },
                      { label: 'Lean Mass', value: wKg > 0 ? `${toDisplay(leanMassKg)} ${unit}` : '—', color: 'text-[#45d0d0]' },
                      { label: 'BMI', value: bmi > 0 ? bmi.toString() : '—', color: bmiColor },
                      { label: 'Category', value: bmiCat, color: bmiColor },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="bg-black/20 border border-white/10 rounded-xl p-4 text-center">
                        <div className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">{label}</div>
                        <div className={`text-lg font-black ${color}`}>{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* --- CALENDAR (Global Footer for Module) --- */}
      <div className="glass-card p-4 md:p-6 transition-all duration-300 ease-in-out hover:-translate-y-1">
          <header className="flex justify-between items-center mb-4">
              <button onClick={() => changeMonth(-1)} className="p-2 hover:text-[#f78121] transition-colors text-white/50"><ChevronLeft size={24} /></button>
              <h3 className="text-sm md:text-xl font-black uppercase tracking-[0.2em] text-white">
                {currentMonthDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
              </h3>
              <button onClick={() => changeMonth(1)} className="p-2 hover:text-[#f78121] transition-colors text-white/50"><ChevronRight size={24} /></button>
          </header>

          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2 md:mb-4 text-center">
              {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-[10px] font-black text-white/50">{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1 md:gap-2">
              {calendarData.map((day, i) => {
                if (!day) return <div key={`blank-${i}`} className="aspect-square" />;

                const hasNutritionDot = activeTab === 'Nutrition' && data.health.mealLogs.some(m => m.timestamp.startsWith(day.dateStr));
                const hasActivity = hasData(day.log) || hasNutritionDot;
                const isToday = day.dateStr === todayStr;
                const isSelected = day.dateStr === selectedDate;

                let activeColor = 'bg-[#f78121]';
                if (activeTab === 'Fasting') activeColor = 'bg-[#45d0d0]';
                if (activeTab === 'Sleep') activeColor = 'bg-indigo-500';

                return (
                    <div
                      key={day.dateStr}
                      onClick={() => setSelectedDate(day.dateStr)}
                      className={`aspect-square rounded-lg md:rounded-xl flex flex-col items-center justify-center relative border transition-all cursor-pointer ${
                        isToday
                          ? 'border-[#f78121] bg-white/10 shadow-sm'
                          : isSelected
                          ? 'border-white/50 bg-white/15 shadow-sm'
                          : 'border-transparent bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      <span className={`text-[10px] md:text-xs font-bold ${isToday || isSelected ? 'text-white' : 'text-white/50'}`}>{day.dayNum}</span>
                      {hasActivity && (
                          <div className={`w-1.5 h-1.5 rounded-full mt-1 ${activeColor}`} />
                      )}
                    </div>
                )
              })}
          </div>
      </div>
    </div>
  );
};

export default AgelessLiving;
