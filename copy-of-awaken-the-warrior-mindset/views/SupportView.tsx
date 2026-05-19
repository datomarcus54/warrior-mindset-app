
import React, { useState } from 'react';
import { UserData } from '../types';
import { HelpCircle, ChevronDown, ChevronUp, Mail, Send, FileText, Shield, LifeBuoy, X, Lock, Info } from 'lucide-react';

interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
  isGuest: boolean;
  onRestricted: () => void;
}

const FAQS = [
  {
    question: "How do I track my Warrior Points (XP)?",
    answer: "XP is currency. Earn it by executing Habits, securing Goals, and logging Journals. Your Rank reflects your discipline, not your intentions."
  },
  {
    question: "How does the Vision Radar work?",
    answer: "The Radar scans 8 operational sectors. Adjust the sliders to reflect reality, not fantasy. A broken wheel cannot roll. Fix the gaps."
  },
  {
    question: "Can I reset my progress?",
    answer: "Resets are available. Contact Support. Warning: This wipes your history. Ensure you are ready to start from zero."
  },
  {
    question: "What is the purpose of Coach Marcus AI?",
    answer: "Coach Marcus AI is not a friend. He is a strategic asset designed to break your excuses and force action. Use him when you are stuck or drifting."
  },
  {
    question: "Is my data private?",
    answer: "Your data is encrypted and secure. We do not sell your data. Your personal information remains private."
  }
];

const SupportView: React.FC<Props> = ({ isGuest, onRestricted }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showToS, setShowToS] = useState(false);
  const [showLesson, setShowLesson] = useState(false);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if(isGuest) {
        onRestricted();
        return;
    }
    if (!form.name || !form.email || !form.message) return;
    // Simulate send
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setForm({ name: '', email: '', message: '' });
    }, 3000);
  };

  const LegalModal = ({ title, onClose, children }: { title: string, onClose: () => void, children?: React.ReactNode }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#001b3d]/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="glass-card w-full max-w-2xl max-h-[80vh] flex flex-col border-[#f78121]/30 shadow-[0_0_50px_rgba(15,23,42,0.6)] relative bg-[#595b61]">
         <div className="flex justify-between items-center p-6 border-b border-white/20 bg-[#595b61]">
            <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121]">{title}</h3>
            <button onClick={onClose} className="text-white hover:text-red-500 transition-colors"><X size={24} /></button>
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

  return (
    <div className="space-y-12 md:space-y-16 pb-20 md:px-8 lg:px-16">
      
      {/* Warrior Lesson Popup */}
      {showLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-[#001b3d]/90 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="relative w-full max-w-md bg-[#595b61] p-8 md:p-10 border border-[#f78121]/30 rounded-2xl shadow-2xl">
              <button onClick={() => setShowLesson(false)} className="absolute top-4 right-4 text-white hover:text-red-500 transition-colors"><X size={24}/></button>
              <div className="mb-6">
                <div className="w-12 h-12 bg-[#f78121]/10 rounded-full flex items-center justify-center border border-[#f78121]/30">
                  <Info size={24} className="text-[#f78121]" />
                </div>
              </div>
              <h3 className="text-xl font-black font-brand-header uppercase tracking-tight text-[#f78121] mb-4">Help & Contact</h3>
              <p className="text-base text-white font-medium leading-relaxed italic">
                "This is your link to the command center. Use it to report obstacles, seek guidance, or manage your account trajectory."
              </p>
           </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacy && (
        <LegalModal title="Privacy Policy" onClose={() => setShowPrivacy(false)}>
           <div className="space-y-4">
              <p><strong>1. Data Collection & Usage</strong><br/>We collect email addresses solely for secure account authentication and service communication. We do not sell, rent, or trade your personal information.</p>
              
              <p><strong>2. Financial Security</strong><br/>All subscription and payment processing is handled by secure, industry-standard third-party processors (e.g., Stripe). We do not store your credit card information on our servers.</p>
              
              <p><strong>3. Journal & Data Confidentiality</strong><br/>Your personal journal entries, financial data, and strategic plans are strictly confidential. They are encrypted before storage, ensuring that your private reflections remain accessible only to you.</p>
              
              <p><strong>4. Third-Party Services</strong><br/>We may use trusted third-party services for hosting and analytics to improve app performance, strictly bound by confidentiality agreements.</p>
           </div>
        </LegalModal>
      )}

      {/* Terms of Service Modal */}
      {showToS && (
        <LegalModal title="Terms of Service" onClose={() => setShowToS(false)}>
           <div className="space-y-4">
              <p><strong>1. Service Description</strong><br/>'Warrior Mindset' is a subscription-based Software-as-a-Service (SaaS) platform designed for personal development, productivity, and habit tracking.</p>
              
              <p><strong>2. Account Responsibility</strong><br/>You are responsible for maintaining the confidentiality of your login credentials. Any activity occurring under your account is your sole responsibility.</p>
              
              <p><strong>3. Educational Disclaimer</strong><br/>This application is a tool for education and self-improvement based on the 'Awaken the Warrior Mindset' philosophy. It does not constitute medical, psychological, or financial advice.</p>
              
              <p><strong>4. Subscription & Cancellation</strong><br/>Subscriptions are billed in advance on a recurring basis. You may cancel your subscription at any time; access will continue until the end of the current billing cycle.</p>
              
              <p><strong>5. Code of Conduct</strong><br/>Users engaging in the Community features must adhere to the Warrior Code: respect, integrity, and support. Harassment or hate speech will result in immediate account termination.</p>
           </div>
        </LegalModal>
      )}

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3">
           <h2 className="text-4xl md:text-6xl font-black font-brand-header uppercase text-[#f78121] tracking-wider whitespace-nowrap">Command Uplink</h2>
           <button onClick={() => setShowLesson(true)} className="text-[#f78121] hover:text-white cursor-pointer transition-colors" aria-label="Warrior Lesson">
             <Info size={24} />
           </button>
        </div>
        <p className="text-xs md:text-base text-[#45d0d0] font-black uppercase tracking-[0.2em] mt-2">Support Logistics</p>
      </header>

      {/* FAQ Accordion */}
      <section className="glass-card p-6 md:p-10 shadow-glass transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="flex items-center space-x-3 mb-8">
           <HelpCircle className="text-[#f78121] w-6 h-6" />
           <h3 className="text-sm md:text-base font-black font-brand-header uppercase tracking-[0.2em] text-white">Frequency Asked Questions</h3>
        </div>
        
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className={`border border-white/20 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-white/10 border-[#f78121]' : 'hover:bg-white/5'}`}>
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left"
                >
                  <span className={`text-xs md:text-sm font-bold uppercase tracking-wide ${isOpen ? 'text-[#f78121]' : 'text-white'}`}>
                    {faq.question}
                  </span>
                  {isOpen ? <ChevronUp size={16} className="text-[#f78121]" /> : <ChevronDown size={16} className="text-white/50" />}
                </button>
                <div 
                  className={`px-5 md:px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <p className="text-sm text-white/90 leading-relaxed font-bold">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Form */}
      <section className="glass-card p-6 md:p-10 relative overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-1">
        <div className="absolute top-0 right-0 p-12 opacity-[0.05] pointer-events-none">
           <Mail size={150} className="text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row gap-8 md:gap-12">
           <div className="flex-1">
              <h3 className="text-xl md:text-2xl font-black font-brand-header uppercase text-[#f78121] mb-4">Request Reinforcements</h3>
              <p className="text-sm text-white/80 mb-8 leading-relaxed font-medium">
                Encountering a system error or have a suggestion? 
                Transmit your message directly to us. Expect a response within 24 hours.
              </p>
              
              <div className="space-y-6">
                 <div className="flex items-center space-x-4 text-sm font-bold text-white">
                    <div className="w-10 h-10 rounded-full bg-[#f78121]/10 flex items-center justify-center text-[#f78121]">
                       <Mail size={18} />
                    </div>
                    <span>support@warriormindset.app</span>
                 </div>
                 <div className="flex items-center space-x-4 text-sm font-bold text-white">
                    <div className="w-10 h-10 rounded-full bg-[#f78121]/10 flex items-center justify-center text-[#f78121]">
                       <Shield size={18} />
                    </div>
                    <span>Send Message</span>
                 </div>
              </div>
           </div>

           <form onSubmit={handleSend} className="flex-1 space-y-4 md:space-y-6 bg-[#595b61] p-6 rounded-3xl border border-white/20 shadow-sm">
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#f78121] mb-2 block">Warrior Name</label>
                 <input 
                   type="text" 
                   value={form.name}
                   onChange={e => setForm({...form, name: e.target.value})}
                   className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70"
                   placeholder="Enter identification..."
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#f78121] mb-2 block">Email Frequency</label>
                 <input 
                   type="email" 
                   value={form.email}
                   onChange={e => setForm({...form, email: e.target.value})}
                   className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70"
                   placeholder="Enter email address..."
                 />
              </div>
              <div>
                 <label className="text-[10px] font-black uppercase tracking-widest text-[#f78121] mb-2 block">Message</label>
                 <textarea 
                   value={form.message}
                   onChange={e => setForm({...form, message: e.target.value})}
                   className="w-full bg-[#eef1f1] border border-[#45d0d0]/20 rounded-xl p-4 text-sm text-[#595b61] font-bold focus:outline-none focus:border-[#f78121] transition-all placeholder:text-[#595b61]/70 min-h-[120px]"
                   placeholder="Detail your inquiry..."
                 />
              </div>
              
              <button 
                type="submit"
                disabled={sent}
                className={`w-full py-4 md:py-5 rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center space-x-2 transition-all shadow-lg ${sent ? 'bg-[#45d0d0] text-white' : 'bg-[#f78121] text-white hover:bg-orange-600 active:scale-[0.98]'}`}
              >
                 {sent ? (
                    <><span>Message Sent</span> <Send size={16} /></>
                 ) : (
                    <><span>Transmit</span> <Send size={16} /></>
                 )}
              </button>
           </form>
        </div>
      </section>

      {/* Legal Footer */}
      <footer className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-8 pt-8 border-t border-white/10">
         <button onClick={() => setShowPrivacy(true)} className="flex items-center space-x-2 text-white/50 hover:text-[#f78121] transition-colors text-[10px] uppercase font-black tracking-widest">
            <FileText size={12} />
            <span>Privacy Policy</span>
         </button>
         <button onClick={() => setShowToS(true)} className="flex items-center space-x-2 text-white/50 hover:text-[#f78121] transition-colors text-[10px] uppercase font-black tracking-widest">
            <Shield size={12} />
            <span>Terms of Service</span>
         </button>
         <span className="text-[10px] text-white/50 font-bold">v3.0.0 • Warrior App</span>
      </footer>

    </div>
  );
};

export default SupportView;
