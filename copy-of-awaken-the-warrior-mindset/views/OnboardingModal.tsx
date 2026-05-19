
import React, { useState } from 'react';
import { Trophy, BookOpen, Heart, TrendingUp, Shield, Bot, Layers, ChevronLeft, ChevronRight, X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const modules = [
  { icon: Layers,     label: 'Foundation', desc: 'Score your life across 8 areas daily' },
  { icon: BookOpen,   label: 'Journal',    desc: 'Capture your intentions and reflections' },
  { icon: Heart,      label: 'Ageless',    desc: 'Track your body, food, sleep and recovery' },
  { icon: TrendingUp, label: 'Wealth',     desc: 'Monitor your financial position' },
  { icon: Shield,     label: 'Resilience', desc: 'Learn from setbacks and grow stronger' },
];

const TOTAL = 4;

const OnboardingModal: React.FC<Props> = ({ onClose }) => {
  const [slide, setSlide] = useState(0);

  const next = () => setSlide(s => Math.min(s + 1, TOTAL - 1));
  const prev = () => setSlide(s => Math.max(s - 1, 0));

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-[#001b3d]/95 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-[#595b61] rounded-3xl shadow-2xl border border-white/10 overflow-hidden">

        {/* Skip */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors"
        >
          Skip <X size={13} />
        </button>

        {/* Slide area */}
        <div className="px-8 pt-10 pb-4 min-h-[400px] flex flex-col justify-center">

          {/* Slide 0 — Welcome */}
          {slide === 0 && (
            <div key="s0" className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="p-5 bg-[#f78121]/15 rounded-full border border-[#f78121]/30 shadow-lg">
                <Trophy size={44} className="text-[#f78121]" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl md:text-3xl font-black font-brand-header uppercase tracking-widest text-white leading-tight">
                  Awaken the Warrior Mindset
                </h2>
                <p className="text-sm md:text-base text-white/70 font-medium leading-relaxed">
                  This is not a motivation app. It is a daily system for men who refuse to settle. Built on Eastern wisdom. Powered by AI.
                </p>
              </div>
            </div>
          )}

          {/* Slide 1 — Daily Tools */}
          {slide === 1 && (
            <div key="s1" className="flex flex-col space-y-4 animate-in fade-in duration-300">
              <div className="mb-1">
                <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-widest text-white leading-tight">
                  Everything You Need,
                </h2>
                <p className="text-xs text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-0.5">In One Place</p>
              </div>
              <div className="space-y-2.5">
                {modules.map(({ icon: Icon, label, desc }) => (
                  <div key={label} className="flex items-center gap-3 p-3 bg-black/20 rounded-xl border border-white/10">
                    <div className="p-2 bg-[#f78121]/15 rounded-lg shrink-0">
                      <Icon size={17} className="text-[#f78121]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-black uppercase tracking-widest text-white">{label}</span>
                      <p className="text-[11px] text-white/55 font-medium leading-snug">{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Slide 2 — Coach Marcus AI */}
          {slide === 2 && (
            <div key="s2" className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="relative">
                <div className="p-5 bg-[#f78121]/15 rounded-2xl border border-[#f78121]/30 shadow-lg">
                  <Bot size={44} className="text-[#f78121]" />
                </div>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#45d0d0] rounded-full animate-pulse block" />
              </div>
              <div className="space-y-3">
                <h2 className="text-xl md:text-2xl font-black font-brand-header uppercase tracking-widest text-white leading-tight">
                  Your AI Coach Is Ready
                </h2>
                <p className="text-sm md:text-base text-white/70 font-medium leading-relaxed">
                  Coach Marcus AI knows your stats, your goals, and your progress. Ask anything. Get direct, practical guidance — not generic advice.
                </p>
              </div>
            </div>
          )}

          {/* Slide 3 — Get Started */}
          {slide === 3 && (
            <div key="s3" className="flex flex-col items-center text-center space-y-6 animate-in fade-in duration-300">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#45d0d0]">The Path Begins</p>
                <h2 className="text-2xl md:text-3xl font-black font-brand-header uppercase tracking-widest text-white leading-tight">
                  Your Journey Starts Now
                </h2>
              </div>
              <p className="text-sm md:text-base text-white/70 font-medium leading-relaxed px-2">
                Small steps. Consistent practice. Long-term transformation. The path begins today.
              </p>
              <button
                onClick={onClose}
                className="w-full py-4 bg-[#f78121] text-white font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all active:scale-95 shadow-lg text-sm"
              >
                Begin Your Journey
              </button>
            </div>
          )}

        </div>

        {/* Navigation footer */}
        <div className="flex items-center justify-between px-8 py-5">
          <button
            onClick={prev}
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
              slide === 0 ? 'opacity-0 pointer-events-none' : 'text-white/50 hover:text-white'
            }`}
          >
            <ChevronLeft size={15} /> Prev
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: TOTAL }).map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === slide ? 'w-5 h-2 bg-[#f78121]' : 'w-2 h-2 bg-white/25 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors ${
              slide === TOTAL - 1 ? 'opacity-0 pointer-events-none' : 'text-white/50 hover:text-white'
            }`}
          >
            Next <ChevronRight size={15} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default OnboardingModal;
