import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { UserData } from '../types';
import { DAILY_AFFIRMATIONS } from '../constants';
import { Sparkles, Quote, Info, X, Save, Trash2 } from 'lucide-react';

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

      {/* Life Wheel Radar — chart only, no inputs inside this glass-card */}
      <section className="glass-card p-6 md:p-10">
        <div className="mb-6 md:mb-8">
          <div className="flex items-center gap-[10px] mb-1">
            <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-widest text-[#f78121]">Your Life Circle</h2>
            <button onClick={() => setActiveLesson('RADAR')} className="text-[#f78121] hover:text-[#001b3d] cursor-pointer transition-colors" aria-label="Warrior Lesson">
                <Info size={20} />
            </button>
          </div>
          <p className="text-xs md:text-sm text-white/70 font-black uppercase tracking-widest">How You're Scoring Each Area (1-10)</p>
        </div>

        <div style={{ width: '100%', height: '350px', pointerEvents: 'none', userSelect: 'none' }}>
          {isMounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius={isMobile ? '60%' : '72%'} data={displayData}>
                <PolarGrid stroke="#e5e7eb" strokeWidth={2} strokeOpacity={0.4} />
                <PolarAngleAxis
                  dataKey="displayName"
                  tick={{ fill: 'white', fontSize: isMobile ? 12 : 13, fontWeight: '700' }}
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
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(89,91,97,0.5)', borderRadius: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.3)' }}>Calibrating Radar...</span>
            </div>
          )}
        </div>
      </section>

      {/* +/- stepper cards — pure button onClick, no input elements, works on every browser */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '12px' }}>
        {displayData.map((domain, idx) => (
          <div
            key={domain.name}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '16px 12px' }}
          >
            <span style={{ fontSize: '10px', color: 'white', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'center', lineHeight: 1.3 }}>
              {domain.displayName}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => { if (isGuest) { onRestricted(); return; } handleDomainChange(idx, domain.value - 1); }}
                disabled={domain.value <= 1 || isGuest}
                style={{ width: '32px', height: '32px', borderRadius: '8px', background: domain.value <= 1 ? 'rgba(255,255,255,0.05)' : 'rgba(247,129,33,0.2)', border: '1px solid rgba(247,129,33,0.4)', color: domain.value <= 1 ? 'rgba(255,255,255,0.2)' : '#f78121', fontSize: '20px', fontWeight: '900', cursor: domain.value <= 1 || isGuest ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >−</button>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '36px' }}>
                <span style={{ fontSize: '22px', fontWeight: '900', color: '#f78121', lineHeight: 1 }}>{domain.value}</span>
                <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: '700' }}>/10</span>
              </div>
              <button
                onClick={() => { if (isGuest) { onRestricted(); return; } handleDomainChange(idx, domain.value + 1); }}
                disabled={domain.value >= 10 || isGuest}
                style={{ width: '32px', height: '32px', borderRadius: '8px', background: domain.value >= 10 ? 'rgba(255,255,255,0.05)' : 'rgba(247,129,33,0.2)', border: '1px solid rgba(247,129,33,0.4)', color: domain.value >= 10 ? 'rgba(255,255,255,0.2)' : '#f78121', fontSize: '20px', fontWeight: '900', cursor: domain.value >= 10 || isGuest ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 }}
              >+</button>
            </div>
          </div>
        ))}
      </div>

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
            { label: '5 Years', value: localVision5Year, set: setLocalVision5Year, key: 'vision5Year' as const, placeholder: 'Describe your life in 5 years. Be specific.' },
          ].map(({ label, value, set, key, placeholder }) => (
            <div key={key}>
              <div className="flex items-center justify-between mb-3">
                <label className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-[#45d0d0]">{label}</label>
                {value && !isGuest && (
                  <button onClick={() => { if (!window.confirm(`Clear your ${label} vision?`)) return; set(''); update({ [key]: '' }); }} className="text-white/30 hover:text-red-400 transition-colors"><Trash2 size={13}/></button>
                )}
              </div>
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
