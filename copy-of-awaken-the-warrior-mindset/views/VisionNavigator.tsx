import React, { useMemo, useState, useEffect } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { UserData } from '../types';
import { DAILY_AFFIRMATIONS } from '../constants';
import { Sparkles, Quote, Info, X } from 'lucide-react';

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
    text: "A warrior without a target is just a casualty waiting to happen. Scan the perimeter. Identify the weak points. Reinforce them."
  },
  'VISION': {
    title: "Clarity of Purpose",
    text: "Vague visions produce vague results. Define the target with lethal precision. If you cannot see it, you cannot kill it."
  }
};

const VisionNavigator: React.FC<Props> = ({ data, update, isGuest, onRestricted }) => {
  const [activeLesson, setActiveLesson] = useState<keyof typeof LESSONS | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

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

  const handleDomainChange = (index: number, val: number) => {
    if (isGuest) {
      onRestricted();
      return;
    }
    const newWheel = data.lifeWheel.map((item, i) => {
      if (i === index) {
        return { ...item, value: Math.min(10, Math.max(1, val)) };
      }
      return item;
    });
    update({ lifeWheel: newWheel });
  };
  
  const handleVisionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isGuest) {
      onRestricted();
      return;
    }
    update({ visionText: e.target.value });
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
    <div className="space-y-8 md:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
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
           <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Foundation Protocol</h2>
           <button onClick={() => setActiveLesson('FOUNDATION')} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
              <Info size={24} />
           </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Operational Baseline</p>
      </header>

      {/* Daily Creed */}
      <section className="glass-card p-6 md:p-8 relative overflow-hidden group transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="absolute -top-4 -right-4 opacity-10">
          <Quote size={80} className="text-[#f78121] md:w-24 md:h-24" />
        </div>
        <div className="relative z-10 flex items-start space-x-3 md:space-x-5">
          <Sparkles size={24} className="text-[#f78121] mt-1" />
          <div>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.2em] text-white/60 mb-2 md:mb-4">Daily Doctrine</h2>
            <p className="text-xl md:text-3xl font-brand-quote italic font-bold leading-tight text-white">"{affirmation}"</p>
          </div>
        </div>
      </section>

      {/* Life Wheel Radar */}
      <section className="glass-card p-6 md:p-10 transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-[10px] mb-1">
            <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-widest text-[#f78121]">Radar Sweep</h2>
            <button onClick={() => setActiveLesson('RADAR')} className="text-[#f78121] hover:text-[#001b3d] cursor-pointer transition-colors" aria-label="Warrior Lesson">
                <Info size={20} />
            </button>
          </div>
          <p className="text-xs md:text-sm text-white/70 font-black uppercase tracking-widest">Sector Status Report (1-10)</p>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-8 mt-8 md:mt-12">
          {displayData.map((domain, idx) => (
            <div key={domain.name} className="bg-white/10 border border-white/20 rounded-xl flex flex-col space-y-3 p-4 md:p-6 shadow-sm">
              <div className="flex justify-between items-center w-full whitespace-nowrap">
                <span className="text-[10px] md:text-xs text-white uppercase font-black tracking-widest truncate mr-2">{domain.displayName}</span>
                <span className={`text-sm md:text-base font-black shrink-0 ${domain.value <= 3 ? 'text-red-400' : 'text-[#f78121]'}`}>
                  {domain.value}/10
                </span>
              </div>
              <div onClick={isGuest ? onRestricted : undefined}>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={domain.value} 
                  onChange={(e) => handleDomainChange(idx, parseInt(e.target.value))}
                  className="warrior-slider"
                  disabled={isGuest}
                  style={{ opacity: isGuest ? 0.5 : 1, pointerEvents: isGuest ? 'none' : 'auto' }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* VIVID Vision Statement */}
      <section className="glass-card p-6 md:p-10 transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="flex items-center gap-[10px] mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-widest text-[#f78121]">Target Acquisition</h2>
            <button onClick={() => setActiveLesson('VISION')} className="text-[#f78121] hover:text-[#001b3d] cursor-pointer transition-colors" aria-label="Warrior Lesson">
                <Info size={20} />
            </button>
        </div>
        <div onClick={isGuest ? onRestricted : undefined}>
            <textarea
              value={data.visionText}
              onChange={handleVisionChange}
              placeholder="Dictate the future state. Be precise. Be lethal. What does the victory look like?"
              className="w-full h-64 md:h-80 warrior-input rounded-xl p-6 md:p-8 text-base md:text-lg text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70 leading-relaxed disabled:opacity-50"
              disabled={isGuest}
            />
        </div>
        <div className="mt-4 md:mt-6 flex justify-between items-center opacity-80">
           <span className="text-[10px] md:text-xs text-white/60 uppercase font-black tracking-widest">36 Month Horizon</span>
           <span className="text-[10px] md:text-xs text-[#f78121] uppercase font-black">Sync Active</span>
        </div>
      </section>
    </div>
  );
};

export default VisionNavigator;
