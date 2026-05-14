
import React, { useState } from 'react';
import { UserData } from '../types';
import { 
  Compass, ShieldAlert, Activity, Users, History, 
  Wallet, BookOpen, Scroll, Info, ArrowUpRight, ShieldCheck,
  Zap, Flame, X, FileText, Shield
} from 'lucide-react';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
  isGuest: boolean;
  onRestricted: () => void;
}

const CodexView: React.FC<Props> = () => {
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showToS, setShowToS] = useState(false);
  const [showLesson, setShowLesson] = useState(false);

  const LegalModal = ({ title, onClose, children }: { title: string, onClose: () => void, children?: React.ReactNode }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001b3d]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col border-white/20 shadow-2xl relative bg-[#595b61]">
         <div className="flex justify-between items-center p-6 border-b border-white/20 bg-[#595b61]">
            <h3 className="text-2xl font-brand-header font-black uppercase tracking-tight text-white">{title}</h3>
            <button onClick={onClose} className="text-white hover:text-[#f78121] transition-colors"><X size={24} /></button>
         </div>
         <div className="p-6 md:p-10 overflow-y-auto custom-scrollbar text-white space-y-6 leading-relaxed bg-[#595b61]">
            {children}
            <div className="pt-6 border-t border-white/20 text-xs text-white/50 italic">
                For full legal documentation or inquiries, contact <span className="text-[#f78121]">support@warriormindset.io</span>.
            </div>
         </div>
         <div className="p-6 border-t border-white/20 bg-[#595b61] flex justify-end">
            <button onClick={onClose} className="px-6 py-2 bg-[#f78121] text-white rounded-lg font-bold uppercase text-xs tracking-widest hover:bg-orange-600 transition-colors">
              Acknowledge
            </button>
         </div>
      </div>
    </div>
  );

  const OperatingCard = ({ title, description, icon: Icon, tier, glow = false }: { title: string, description: string, icon: any, tier: 'command' | 'support' | 'endgame', glow?: boolean }) => (
    <div className={`p-6 md:p-8 relative overflow-hidden group glass-card transition-all duration-300 ease-in-out hover:shadow-[0_0_25px_rgba(247,129,33,0.4)] hover:border-[#f78121]/50 hover:-translate-y-1`}>
       {glow && <div className="absolute top-0 right-0 p-10 opacity-10 bg-[#f78121] blur-3xl rounded-full" />}
       <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
             <div className="flex items-center gap-3">
                <Icon size={24} className="text-[#f78121] drop-shadow-sm" strokeWidth={2.5} />
                <h3 className="text-lg md:text-xl font-brand-header font-black uppercase tracking-tight text-white group-hover:text-[#f78121] transition-colors">{title}</h3>
             </div>
             {tier === 'command' && <div className="h-1.5 w-1.5 rounded-full bg-[#f78121] animate-pulse" />}
          </div>
          <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-2xl font-brand-body font-medium">
             {description}
          </p>
       </div>
    </div>
  );

  return (
    <div className="space-y-12 md:space-y-16 pb-24">
      {showPrivacy && (
        <LegalModal title="Privacy Protocol" onClose={() => setShowPrivacy(false)}>
           <div className="space-y-4"><p><strong>1. Data Collection & Usage</strong><br/>We collect email addresses solely for secure account authentication.</p></div>
        </LegalModal>
      )}
      {showToS && (
        <LegalModal title="Terms of Service" onClose={() => setShowToS(false)}>
           <div className="space-y-4"><p><strong>1. Service Description</strong><br/>Warrior Mindset is a premium personal operating system.</p></div>
        </LegalModal>
      )}
      
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-white/20 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-white mb-4">System Architecture</h3>
              <p className="text-base text-white/80 font-medium leading-relaxed italic">
                "The System Manual is not a philosophy textbook. It is a set of executable protocols for navigating chaos and building legacy."
              </p>
           </div>
        </div>
      )}

      <header className="mb-8">
        <div className="flex items-center gap-3">
          <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Field Manual (SOP)</h2>
          <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
            <Info size={24} />
          </button>
        </div>
        <p className="text-xs md:text-sm text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Standard Operating Procedures</p>
      </header>

      <section className="animate-in fade-in slide-in-from-top-2">
         <div className="glass-card p-8 rounded-xl shadow-lg relative overflow-hidden bg-[#595b61] border-[#f78121] border-opacity-30 transition-all duration-300 ease-in-out hover:shadow-[0_0_25px_rgba(247,129,33,0.4)] hover:border-[#f78121]/50 hover:-translate-y-1">
            <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={100} className="text-[#f78121]" /></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-6">
               <div className="flex-1">
                  <h3 className="text-2xl font-brand-header font-black uppercase tracking-tight text-white mb-2">How the Warrior Mindset Works</h3>
                  <p className="text-base text-white/80 font-medium leading-relaxed">
                     The book taught the framework. This app demands the execution. Read the manual, deploy the protocols, and report the results.
                  </p>
               </div>
               <div className="shrink-0">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#f78121]/10 border border-[#f78121]/30 rounded-lg text-xs font-black uppercase tracking-widest text-white">
                     <Activity size={14} className="text-[#f78121]" /> System Active
                  </span>
               </div>
            </div>
         </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1">
           <ShieldCheck size={16} className="text-[#f78121]" />
           <span className="text-xs font-black uppercase tracking-[0.25em] text-white/50">Tier 1: Core Systems</span>
        </div>
        <div className="grid grid-cols-1 gap-4">
           <OperatingCard tier="command" title="Strategic Alignment Scan" description="Diagnostic tool for trajectory vs. intended destination. Identifies operational drift." icon={Compass} />
           <OperatingCard tier="command" title="Challenge Response System" description="Protocol for emotional regulation and decision-making during high-stress combat scenarios." icon={ShieldAlert} />
           <OperatingCard tier="command" title="Vitality & Longevity Systems" description="Biological hardware maintenance. Sleep, fuel, and kinetic output optimization is mandatory." icon={Activity} />
        </div>
      </section>

      {/* Tier 2 & 3 similarly styled */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1"><Users size={16} className="text-white/50" /><span className="text-xs font-black uppercase tracking-[0.25em] text-white/50">Tier 2: Growth Systems</span></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <OperatingCard tier="support" title="Wealth Discipline Framework" description="Eliminate financial fog. Deploy capital with intentionality. Secure resources." icon={Wallet} />
           <OperatingCard tier="support" title="Alliance & Brotherhood Design" description="Audit the circle. Eliminate weak links. Strengthen the tribe." icon={Users} />
           <OperatingCard tier="support" title="Community Code of Conduct" description="Shared values. Mutual respect. Zero tolerance for weakness." icon={Scroll} />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2 px-1"><History size={16} className="text-white/50" /><span className="text-xs font-black uppercase tracking-[0.25em] text-white/50">Tier 3: Legacy</span></div>
        <OperatingCard tier="endgame" title="Legacy & Impact Blueprint" description="What you leave behind is the only thing that matters." icon={History} glow={true} />
      </section>

      <footer className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 pt-12 border-t border-white/10 opacity-80 hover:opacity-100 transition-opacity text-white/50">
         <button onClick={() => setShowPrivacy(true)} className="flex items-center space-x-2 hover:text-[#f78121] transition-colors text-[10px] uppercase font-black tracking-widest"><FileText size={12} /><span>Privacy Policy</span></button>
         <button onClick={() => setShowToS(true)} className="flex items-center space-x-2 hover:text-[#f78121] transition-colors text-[10px] uppercase font-black tracking-widest"><Shield size={12} /><span>Terms of Service</span></button>
         <span className="text-[10px] font-bold">v3.0.0 • Warrior OS</span>
      </footer>
    </div>
  );
};

export default CodexView;
