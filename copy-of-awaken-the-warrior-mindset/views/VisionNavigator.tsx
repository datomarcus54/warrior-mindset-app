import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { UserData } from '../types';
import { DAILY_AFFIRMATIONS } from '../constants';
import { Sparkles, Quote, Info, X, Save } from 'lucide-react';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
  isGuest: boolean;
  onRestricted: () => void;
}

const LESSONS = {
  'FOUNDATION': {
    title: "Truth Over Convenience",
    text: "Lies are soft. Truth is hard. The Vision Radar demands brutal honesty. If you are failing in a sector, admit it. That is the only way to repair the breach."
  },
  'RADAR': {
    title: "Antifragile Diagnostic",
    text: "A warrior without a clear goal drifts. Look honestly at where you are. Identify what needs work. Strengthen it."
  },
  'VISION': {
    title: "Clarity of Purpose",
    text: "Vague visions produce vague results. Define your goal with precision. If you cannot see it clearly, you cannot reach it."
  }
};

const VisionNavigator: React.FC<Props> = ({ data, update, isGuest, onRestricted }) => {
  const [activeLesson, setActiveLesson] = useState<keyof typeof LESSONS | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [localVision1Year, setLocalVision1Year] = useState(data.vision1Year || '');
  const [localVision3Year, setLocalVision3Year] = useState(data.vision3Year || '');
  const [localVision5Year, setLocalVision5Year] = useState(data.vision5Year || '');

  const flushRef = useRef<() => void>(() => {});
  flushRef.current = () => {
    if (isGuest) return;
    update({ vision1Year: localVision1Year, vision3Year: localVision3Year, vision5Year: localVision5Year });
  };

  useEffect(() => {
    return () => { flushRef.current(); };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 200);

    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  const handleSave = useCallback(() => {
    if (isGuest) return;
    update({ vision1Year: localVision1Year, vision3Year: localVision3Year, vision5Year: localVision5Year, lastFoundationSave: new Date().toISOString() });
  }, [isGuest, update, localVision1Year, localVision3Year, localVision5Year]);

  const lastSaveFormatted = useMemo(() => {
    if (!data.lastFoundationSave) return null;
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(data.lastFoundationSave));
  }, [data.lastFoundationSave]);

  const handleDomainChange = (index: number, val: number) => {
    if (isGuest) return;
    const newWheel = data.lifeWheel.map((item, i) => {
      if (i === index) {
        return { ...item, value: Math.min(10, Math.max(1, val)) };
      }
      return item;
    });
    update({ lifeWheel: newWheel });
  };
  

  const affirmation = useMemo(() => {
    const day = new Date().getDate();
    return DAILY_AFFIRMATIONS[day % DAILY_AFFIRMATIONS.length];
  }, []);

  const displayData = useMemo(() => {
    return data.lifeWheel.map(item => {
        let displayName = item.name;
        
        // RENAME: Change "Environment" to "Home" globally for display
        if (item.name === 'Environment') displayName = 'Home'; 

        // Mobile specific shorteners
        if (isMobile) {
            if (item.name === 'Health') displayName = 'Body';
            if (item.name === 'Spirit') displayName = 'Soul';
            if (item.name === 'Career') displayName = 'Work';
        }
        return { ...item, displayName };
    });
  }, [data.lifeWheel, isMobile]);

  return (
    <div className="space-y-8 md:space-y-10 relative">
      
      {activeLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border-4 border-[#001b3d] rounded-2xl shadow-2xl">
              <button onClick={() => setActiveLesson(null)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <div className="mb-6">
                <div className="w-12 h-12 bg-[#f78121]/10 rounded-full flex items-center justify-center border border-[#f78121]/30">
                  <Info size={24} className="text-[#f78121]" />
                </div>
              </div>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-widest text-[#f78121] mb-4">{LESSONS[activeLesson].title}</h3>
              <p className="text-base text-white font-medium leading-relaxed italic">
                "{LESSONS[activeLesson].text}"
              </p>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
           <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Foundation</h2>
           <button onClick={() => setActiveLesson('FOUNDATION')} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
              <Info size={24} />
           </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Where You Stand Today</p>
      </header>

      {/* Daily Creed */}
      <section className="glass-card p-6 md:p-8 relative overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="absolute -top-4 -right-4 opacity-10">
          <Quote size={80} className="text-[#f78121] md:w-24 md:h-24" />
        </div>
        <div className="relative z-10 flex items-start space-x-3 md:space-x-5">
          <Sparkles size={24} className="text-[#f78121] mt-1" />
          <div>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/60 mb-2 md:mb-4">Today's Reflection</h2>
            <p className="text-xl md:text-3xl font-brand-quote italic font-bold leading-tight text-white">"{affirmation}"</p>
          </div>
        </div>
      </section>

      {/* Life Wheel Radar */}
      <section className="glass-card p-6 md:p-10 transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-[10px] mb-1">
            <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-widest text-[#f78121]">Your Life Circle</h2>
            <button onClick={() => setActiveLesson('RADAR')} className="text-[#f78121] hover:text-[#001b3d] cursor-pointer transition-colors" aria-label="Warrior Lesson">
                <Info size={20} />
            </button>
          </div>
          <p className="text-xs md:text-sm text-white/70 font-black uppercase tracking-widest">How You're Scoring Each Area (1-10)</p>
        </div>
        
        <div className="w-full h-[350px] min-h-[350px] relative">
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              {/* FIX: Reduced outerRadius on mobile from 75% to 60% to prevent label clipping */}
              <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? "60%" : "75%"} data={displayData}>
                <PolarGrid stroke="#e5e7eb" strokeWidth={2} strokeOpacity={0.4} />
                <PolarAngleAxis 
                  dataKey="displayName" 
                  tick={{ fill: 'white', fontSize: isMobile ? 12 : 14, fontWeight: '700' }} 
                />
                <Radar
                  name="Current State"
                  dataKey="value"
                  stroke="#f78121"
                  strokeWidth={3}
                  fill="#f78121"
                  fillOpacity={0.4}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
             <div className="w-full h-full bg-[#595b61]/50 animate-pulse rounded-xl border border-white/5 flex items-center justify-center">
                <span className="text-xs font-black uppercase tracking-widest text-white/30">Calibrating Radar...</span>
             </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 mt-8 md:mt-12">
          {displayData.map((domain, idx) => (
            <div key={domain.name} className="bg-white/10 border border-white/20 rounded-xl flex flex-col items-center justify-center p-4 md:p-5 gap-3 shadow-sm">
              <span className="text-[10px] md:text-xs text-white uppercase font-black tracking-widest text-center leading-tight">{domain.displayName}</span>
              <div className="flex items-center gap-1.5" onClick={isGuest ? onRestricted : undefined}>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={domain.value}
                  onChange={(e) => handleDomainChange(idx, parseInt(e.target.value) || 0)}
                  disabled={isGuest}
                  className="w-14 bg-[#0A3762] border border-[#f78121]/40 rounded-lg px-2 py-1.5 text-center font-black text-[#f78121] text-base outline-none focus:border-[#f78121] disabled:opacity-50"
                />
                <span className="text-white/50 text-xs font-black">/10</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VIVID Vision Statement */}
      <section className="glass-card p-6 md:p-10 transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="flex items-center gap-[10px] mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-widest text-[#f78121]">Your Vision</h2>
            <button onClick={() => setActiveLesson('VISION')} className="text-[#f78121] hover:text-[#001b3d] cursor-pointer transition-colors" aria-label="Warrior Lesson">
                <Info size={20} />
            </button>
        </div>
        <div className="space-y-6 md:space-y-8" onClick={isGuest ? onRestricted : undefined}>
          {[
            { label: '1 Year', value: localVision1Year, set: setLocalVision1Year, key: 'vision1Year' as const, placeholder: 'Where will you be in 12 months? Be specific.' },
            { label: '3 Years', value: localVision3Year, set: setLocalVision3Year, key: 'vision3Year' as const, placeholder: 'What does victory look like in 3 years?' },
            { label: '5 Years', value: localVision5Year, set: setLocalVision5Year, key: 'vision5Year' as const, placeholder: 'Dictate the 5-year future state. Be lethal.' },
          ].map(({ label, value, set, key, placeholder }) => (
            <div key={key}>
              <label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#45d0d0] block mb-3">{label}</label>
              <textarea
                value={value}
                onChange={(e) => { if (isGuest) { onRestricted(); return; } set(e.target.value); }}
                onBlur={() => { if (!isGuest) update({ [key]: value }); }}
                placeholder={placeholder}
                disabled={isGuest}
                className="w-full h-40 md:h-48 warrior-input rounded-xl p-4 md:p-6 text-sm md:text-base text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70 leading-relaxed disabled:opacity-50"
              />
            </div>
          ))}
        </div>
        <div className="mt-6 md:mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex flex-col gap-1">
            {lastSaveFormatted && (
              <span className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Last saved: {lastSaveFormatted}</span>
            )}
          </div>
          {!isGuest && (
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#f78121] text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-white hover:text-[#0A3762] transition-all self-start sm:self-auto"
            >
              <Save size={14} />
              Save Foundation
            </button>
          )}
        </div>
      </section>
    </div>
  );
};

export default VisionNavigator;
