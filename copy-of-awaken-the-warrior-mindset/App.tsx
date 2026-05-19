import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Trophy, Sparkles, Bot, X, Menu, LifeBuoy, BookOpen, LogOut, User, BarChart3, Lock, Shield, Compass
} from 'lucide-react';
import { UserData, ViewType } from './types';
import { INITIAL_USER_DATA, getRank, WARRIOR_RANKS } from './constants';

// Views
import FoundationView from './views/FoundationView';
import ResilienceView from './views/ResilienceView';
import AgelessLiving from './views/AgelessLiving';
import MasteryView from './views/MasteryView';
import LegacyView from './views/LegacyView';
import CommunityView from './views/CommunityView';
import CoachMarcus from './views/CoachMarcus';
import SupportView from './views/SupportView';
import CodexView from './views/CodexView';
import TribeView from './views/TribeView';
import JournalView from './views/JournalView';
import SubscriptionView from './views/SubscriptionView';
import OnboardingModal from './views/OnboardingModal';

// --- CONSOLE SILENCER ---
// This suppresses the harmless "width(-1)" warning from Recharts during animations
const originalWarn = console.warn;
const originalError = console.error;
console.warn = (...args) => {
  if (args[0]?.includes && args[0].includes('width(-1)')) return;
  originalWarn(...args);
};
console.error = (...args) => {
  if (args[0]?.includes && args[0].includes('width(-1)')) return;
  originalError(...args);
};
// ------------------------

const STORAGE_KEY = 'warrior_mindset_data_v3';
const GOD_MODE_EMAILS = ['marcus@marveluzzglobal.com', 'roslankhalid54@gmail.com'];

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true }; }
  componentDidCatch(error: any, errorInfo: any) { 
    // Only log real errors, not the width ones
    if (!error.toString().includes('width')) console.log("Caught error:", error); 
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-[#595b61] rounded-2xl border border-red-500/30 m-4">
          <h3 className="text-xl font-black uppercase text-[#f78121] mb-2">System Interruption</h3>
          <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }} className="mt-4 px-6 py-2 bg-[#f78121] text-white font-bold rounded-lg hover:bg-orange-600 transition-all">Reboot System</button>
        </div>
      );
    }
    return this.props.children;
  }
}

const App: React.FC = () => {
  const [userData, setUserData] = useState<UserData>(INITIAL_USER_DATA);
  const [currentView, setCurrentView] = useState<ViewType>('Foundation');
  const [showAffirmation, setShowAffirmation] = useState(false);
  const [showScoringRules, setShowScoringRules] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => !localStorage.getItem('onboardingComplete'));
  const [onboardingFromMenu, setOnboardingFromMenu] = useState(false);
  
  const isMobileMode = useMemo(() => {
    const ua = navigator.userAgent || '';
    const search = window.location.search || '';
    return ua.includes('WarriorMobileWrapper') || search.includes('platform=mobile');
  }, []);

  useEffect(() => {
    const w = window as any;
    if (w.netlifyIdentity) {
      try {
        w.netlifyIdentity.init(); 
        const user = w.netlifyIdentity.currentUser();
        setCurrentUser(user);
        w.netlifyIdentity.on('login', (user: any) => {
          setCurrentUser(user);
          w.netlifyIdentity.close();
          window.location.reload(); 
        });
        w.netlifyIdentity.on('logout', () => {
          setCurrentUser(null);
          window.location.reload();
        });
      } catch (e) { console.warn(e); }
    }

    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const mergedHealth = { ...INITIAL_USER_DATA.health, ...(parsed.health || {}) };
        const mergedPosts = parsed.communityPosts || INITIAL_USER_DATA.communityPosts;
        const mergedWorkflows = parsed.dailyWorkflows || [];
        const pf = parsed.financialData || {};
        const mergedFinancialData = {
          ...INITIAL_USER_DATA.financialData,
          ...pf,
          assets: { ...INITIAL_USER_DATA.financialData.assets, ...(pf.assets || {}) },
          liabilities: { ...INITIAL_USER_DATA.financialData.liabilities, ...(pf.liabilities || {}) },
        };
        setUserData({ ...INITIAL_USER_DATA, ...parsed, health: mergedHealth, communityPosts: mergedPosts, dailyWorkflows: mergedWorkflows, financialData: mergedFinancialData });
        const today = new Date().toISOString().split('T')[0];
        if (parsed.lastAffirmationSeen !== today) setShowAffirmation(true);
      } catch (e) { setShowAffirmation(true); }
    } else { setShowAffirmation(true); }
  }, []);

  useEffect(() => {
    if (currentUser && GOD_MODE_EMAILS.includes(currentUser.email)) {
      setUserData(prev => {
        if (prev.tier !== 'Legend' || prev.warriorCodePoints < 5000) {
          return { ...prev, tier: 'Legend', warriorCodePoints: Math.max(prev.warriorCodePoints, 5000) };
        }
        return prev;
      });
    }
  }, [currentUser]);

  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(userData)); }, [userData]);

  const updateData = useCallback((updates: Partial<UserData>) => {
    setUserData(prev => ({ ...prev, ...updates }));
  }, []);

  const enterDashboard = (xpBonus: number) => {
    const today = new Date().toISOString().split('T')[0];
    updateData({ lastAffirmationSeen: today, warriorCodePoints: userData.warriorCodePoints + xpBonus });
    setShowAffirmation(false);
  };

  const handleAcceptMission = () => enterDashboard(15);
  const handleGuestEntry = () => enterDashboard(15);

  const handleOnboardingClose = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setShowOnboarding(false);
    if (!onboardingFromMenu) enterDashboard(15);
    setOnboardingFromMenu(false);
  };

  const openOnboardingFromMenu = () => {
    setOnboardingFromMenu(true);
    setShowOnboarding(true);
    setIsMenuOpen(false);
  };
  const openAuth = (mode: 'login' | 'signup') => { const w = window as any; if (w.netlifyIdentity) w.netlifyIdentity.open(mode); };
  const onRestrictedAction = () => { setCurrentView('Subscription'); };
  const isGuest = !currentUser;

  const renderView = () => {
    const props = { data: userData, update: updateData, isGuest, onRestricted: onRestrictedAction, isMobileMode };
    const views = {
      'Foundation': <FoundationView {...props} onNavigateToCoach={() => setCurrentView('Coach')} />,
      'Journal': <JournalView {...props} />,
      'Resilience': <ResilienceView {...props} />,
      'Ageless': <AgelessLiving {...props} />,
      'Wealth': <MasteryView {...props} />,
      'Tribe': <TribeView {...props} />,
      'Legacy': <LegacyView {...props} />,
      'Community': <CommunityView {...props} />,
      'Support': <SupportView {...props} />,
      'Codex': <CodexView {...props} />,
      'Coach': <CoachMarcus data={userData} />,
      'Subscription': <SubscriptionView data={userData} update={updateData} />,
    };
    return <ErrorBoundary>{views[currentView] || views['Foundation']}</ErrorBoundary>;
  };

  const currentRank = getRank(userData.warriorCodePoints);
  const nextRank = WARRIOR_RANKS[WARRIOR_RANKS.indexOf(currentRank) + 1] || null;
  const progress = nextRank ? ((userData.warriorCodePoints - currentRank.minPoints) / (nextRank.minPoints - currentRank.minPoints)) * 100 : 100;

  const NavItem = ({ view, label }: { view: ViewType, label: string }) => {
    const isActive = currentView === view;
    return (
      <button 
        onClick={() => { setCurrentView(view); setIsMenuOpen(false); }}
        className={`flex items-center justify-center px-4 h-full transition-all duration-300 relative whitespace-nowrap border-t-2 min-w-[80px] ${isActive ? 'border-[#f78121] text-[#f78121] bg-[#001b3d]' : 'border-transparent text-[#7f91aa] hover:text-white bg-[#001b3d]'}`}
      >
        <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest ${isActive ? 'drop-shadow-[0_0_5px_rgba(247,129,33,0.5)]' : ''}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#0A3762] text-white font-brand-body selection:bg-[#f78121] selection:text-white">
      {/* Onboarding */}
      {showOnboarding && <OnboardingModal onClose={handleOnboardingClose} />}

      {/* Scoring Rules */}
      {showScoringRules && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001b3d]/95 backdrop-blur-xl animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 border border-[#45d0d0]/30 rounded-2xl shadow-2xl">
              <button onClick={() => setShowScoringRules(false)} className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"><X size={24}/></button>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-wider text-[#f78121] mb-6 flex items-center gap-2"><Trophy size={24} /> Scoring Rules</h3>
              <div className="space-y-4 text-sm text-white">
                 <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg"><span>Daily Journaling</span><span className="font-bold text-[#45d0d0]">+10 XP</span></div>
                 <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg"><span>Morning Routine</span><span className="font-bold text-[#45d0d0]">+5 XP</span></div>
                 <div className="flex justify-between items-center p-3 bg-black/20 rounded-lg"><span>Deep Work</span><span className="font-bold text-[#45d0d0]">+20 XP</span></div>
              </div>
           </div>
        </div>
      )}

      {/* Daily Affirmation */}
      {showAffirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-[#001b3d]/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 text-center border-4 border-[#001b3d] rounded-3xl shadow-2xl">
            <div className="p-4 bg-[#f78121]/20 rounded-full inline-block mb-6"><Sparkles size={32} className="text-[#f78121]" /></div>
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] text-[#45d0d0] mb-6">Today's Reflection</h2>
            <div className="mb-10 relative px-4"><p className="text-xl md:text-3xl font-brand-quote italic font-bold leading-relaxed text-white">"I am relentless in the pursuit of my best self."</p></div>
            <button onClick={handleAcceptMission} className="w-full py-5 bg-[#f78121] text-white font-black uppercase tracking-widest rounded-xl hover:bg-orange-600 transition-all active:scale-95 text-sm md:text-base flex items-center justify-center space-x-2 shadow-lg"><span>Begin Today's Step</span><span className="bg-[#001b3d]/20 px-2 py-0.5 rounded text-[10px] text-white">+15 Steps</span></button>
            {isGuest && (
              <div className="flex flex-col items-center mt-6 space-y-4">
                <div className="flex justify-center space-x-6">
                  <button onClick={() => openAuth('login')} className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#7f91aa] hover:text-white">Log In</button>
                  <button onClick={() => openAuth('signup')} className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#7f91aa] hover:text-white">Register</button>
                </div>
                <button onClick={handleGuestEntry} className="text-[10px] md:text-xs font-black uppercase tracking-widest text-[#f78121] hover:text-orange-600 border-b border-[#f78121]/30 pb-0.5">Guest Access</button>
              </div>
            )}
          </div>
        </div>
      )}

      {isMenuOpen && <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)} />}
      
      {/* Side Menu */}
      <aside className={`fixed top-0 left-0 bottom-0 z-[90] w-[80%] max-w-xs bg-[#001b3d] border-r border-[#45d0d0]/20 transition-transform duration-300 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
         <div className="p-6 border-b border-[#45d0d0]/20 flex justify-between items-center">
            <span className="text-xl font-brand-header font-black uppercase text-[#f78121] tracking-widest">Command Center</span>
            <button onClick={() => setIsMenuOpen(false)} className="text-[#45d0d0] hover:text-white"><X size={24}/></button>
         </div>
         <div className="p-4 space-y-2">
            <button onClick={() => { setCurrentView('Subscription'); setIsMenuOpen(false); }} className="w-full p-4 flex items-center space-x-4 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-[#f78121]/30">
               <Shield className="text-[#f78121] group-hover:scale-110 transition-transform" />
               <div className="text-left"><span className="block text-sm font-black uppercase tracking-widest text-white">Warrior Rank</span><span className="block text-[10px] text-[#45d0d0]">Status & Tiers</span></div>
            </button>
            <button onClick={() => { setShowScoringRules(true); setIsMenuOpen(false); }} className="w-full p-4 flex items-center space-x-4 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-[#f78121]/30">
               <BarChart3 className="text-[#f78121] group-hover:scale-110 transition-transform" />
               <div className="text-left"><span className="block text-sm font-black uppercase tracking-widest text-white">Scoring Rules</span><span className="block text-[10px] text-[#45d0d0]">Rank Logic</span></div>
            </button>
            <button onClick={() => { setCurrentView('Coach'); setIsMenuOpen(false); }} className="w-full p-4 flex items-center space-x-4 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-[#f78121]/30">
               <Bot className="text-[#f78121] group-hover:scale-110 transition-transform" />
               <div className="text-left"><span className="block text-sm font-black uppercase tracking-widest text-white">Coach Marcus AI</span><span className="block text-[10px] text-[#45d0d0]">AI Accountability</span></div>
            </button>
            <button onClick={() => { setCurrentView('Support'); setIsMenuOpen(false); }} className="w-full p-4 flex items-center space-x-4 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-[#f78121]/30">
               <LifeBuoy className="text-[#45d0d0] group-hover:scale-110 transition-transform" />
               <div className="text-left"><span className="block text-sm font-black uppercase tracking-widest text-white">Help & Resources</span><span className="block text-[10px] text-[#45d0d0]">FAQ & Info</span></div>
            </button>
            <button onClick={openOnboardingFromMenu} className="w-full p-4 flex items-center space-x-4 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-[#f78121]/30">
               <Compass className="text-[#45d0d0] group-hover:scale-110 transition-transform" />
               <div className="text-left"><span className="block text-sm font-black uppercase tracking-widest text-white">App Guide</span><span className="block text-[10px] text-[#45d0d0]">Revisit the tour</span></div>
            </button>
            <button onClick={() => { setCurrentView('Codex'); setIsMenuOpen(false); }} className="w-full p-4 flex items-center space-x-4 hover:bg-white/5 rounded-xl transition-all group border border-transparent hover:border-[#f78121]/30">
               <BookOpen className="text-slate-400 group-hover:text-white group-hover:scale-110 transition-transform" />
               <div className="text-left"><span className="block text-sm font-black uppercase tracking-widest text-white">System Manual</span><span className="block text-[10px] text-[#45d0d0]">Operating System</span></div>
            </button>
         </div>
         <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-[#45d0d0]/20 bg-[#001b3d]">
            {currentUser ? (
               <button onClick={() => {const w=window as any; w.netlifyIdentity.logout()}} className="flex items-center space-x-2 text-slate-400 hover:text-red-500 text-xs font-black uppercase tracking-widest"><LogOut size={16} /> <span>Logout</span></button>
            ) : (
               <div className="space-y-3">
                  <button onClick={() => openAuth('login')} className="w-full flex items-center justify-center space-x-2 bg-white/10 p-3 rounded text-[#f78121] hover:text-white hover:bg-white/20 text-xs font-black uppercase tracking-widest"><User size={16} /> <span>Login</span></button>
               </div>
            )}
         </div>
      </aside>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#001b3d] border-b border-[#45d0d0]/20 z-50 shadow-lg h-[70px]">
        <div className="relative px-4 py-3 flex items-center justify-between h-full">
          <button onClick={() => setIsMenuOpen(true)} className="p-2 text-[#45d0d0] hover:text-white transition-colors z-20"><Menu size={24} /></button>
          
          {/* CENTER LOGO */}
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center pointer-events-none">
             <img src="logo.png" alt="Warrior Mindset" className="h-12 w-auto object-contain pointer-events-auto" onError={(e) => e.currentTarget.style.display = 'none'} /> 
          </div>

          <div className="flex items-center space-x-3 z-20">
             {!currentUser ? (
                <div className="hidden md:flex space-x-4 items-center">
                   <button onClick={() => openAuth('login')} className="text-[10px] font-black uppercase tracking-widest text-[#7f91aa] hover:text-white">Log In</button>
                   <span className="text-[#45d0d0] text-xs">|</span>
                   <button onClick={() => openAuth('signup')} className="text-[10px] font-black uppercase tracking-widest text-[#7f91aa] hover:text-white">Register</button>
                </div>
             ) : (
                <div className="text-right hidden md:block">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#45d0d0]">Rank</div>
                  <div className="text-xs font-bold text-[#f78121]">{currentRank.name}</div>
                </div>
             )}
             
             <div onClick={() => setCurrentView('Subscription')} className="w-8 h-8 rounded-full bg-[#f78121]/10 border border-[#f78121]/30 flex items-center justify-center cursor-pointer hover:bg-[#f78121]/20 transition-colors">
                {currentUser ? <Trophy size={14} className="text-[#f78121]" /> : <Lock size={14} className="text-[#f78121]" />}
             </div>
          </div>
        </div>
        <div className="h-1 bg-[#001b3d] w-full absolute bottom-0">
          <div className="h-full bg-[#f78121] shadow-[0_0_10px_rgba(247,129,33,0.5)] transition-all duration-1000" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 md:px-12 pt-28 pb-[80px] custom-scrollbar bg-[#0A3762]">
        <div className="max-w-3xl mx-auto w-full">{renderView()}</div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-[#001b3d] border-t border-[#45d0d0]/20 z-[100] flex items-center shadow-2xl">
        <div className="flex items-center w-full max-w-3xl mx-auto px-4 overflow-x-auto no-scrollbar gap-0 h-full">
          <NavItem view="Foundation" label="Foundation" />
          <NavItem view="Journal" label="Journal" />
          <NavItem view="Ageless" label="Ageless" />
          <NavItem view="Wealth" label="Wealth" />
          <NavItem view="Resilience" label="Resilience" />
          <NavItem view="Tribe" label="Tribe" />
          <NavItem view="Community" label="Community" />
          <NavItem view="Legacy" label="Legacy" />
        </div>
      </nav>
    </div>
  );
};

export default App;