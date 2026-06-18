import React, { useState } from 'react';
import { UserData, MissionPlan } from '../types';
import { saveMissionPlan } from '../services/missionPlanService';
interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
  userId: string;
}
interface QAPair {
  question: string;
  answer: string;
}
const MissionControl: React.FC<Props> = ({ data, update, userId }) => {
  const [mode, setMode] = useState<'home' | 'ai-setup' | 'upload' | 'dashboard'>(
    data.missionPlan?.goalTitle ? 'dashboard' : 'home'
  );
  const [conversation, setConversation] = useState<QAPair[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('What is your main goal for the next 12 months? Include a specific number and a target date.');
  const [currentInput, setCurrentInput] = useState('');
  const [readiness, setReadiness] = useState(0);
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [premortемNote, setPremortемNote] = useState('');
  const [insufficientInfo, setInsufficientInfo] = useState('');
  const [error, setError] = useState('');
  const plan = data.missionPlan;
  const completedCount = plan?.milestones.filter(m => m.status === 'Done').length || 0;
  const totalCount = plan?.milestones.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const maxQuestions = 10;
  const getNextQuestion = async (updatedConversation: QAPair[]): Promise<{ question: string; readiness: number; sufficient: boolean; gaps: string }> => {
    const conversationText = updatedConversation.map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`).join('\n\n');
    const prompt = `You are Coach Marcus AI building a business or personal plan. Review this conversation and return JSON only.
Conversation so far:
${conversationText}
Assess what information is still missing to build a REALISTIC and MATHEMATICALLY SOUND plan. Score the readiness from 0 to 100.
Readiness scoring:
- 0-30: Missing goal, timeline, or basic context
- 31-50: Has goal but missing revenue math, constraints, or execution details  
- 51-70: Has most details but gaps in numbers or feasibility
- 71-85: Enough to build a solid plan with some assumptions
- 86-100: Complete information for a fully realistic plan
Return exactly this JSON:
{"nextQuestion":"the single most important missing piece as a direct question — if readiness is 70 or above return empty string","readiness":45,"sufficient":false,"gaps":"comma separated list of what is still missing — if sufficient return empty string"}
Rules:
- Ask about revenue math if user mentioned income but not price or volume
- Ask about time availability if user mentioned health or sleep constraints
- Ask about market if user mentioned customers but not how they will reach them
- Ask about budget if execution requires spending but no budget mentioned
- Ask about team if scale requires people but user seems solo
- Mark sufficient true when readiness reaches 70 or above
- Never ask more than is needed — if readiness is already 70 return empty nextQuestion`;
    try {
      const res = await fetch('/.netlify/functions/generate-mission-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const result = await res.json();
      const clean = (result.plan || '').replace(/```json|```/g, '').trim();
      return JSON.parse(clean);
    } catch {
      return { question: '', readiness: 70, sufficient: true, gaps: '' };
    }
  };
  const handleAnswer = async (answer: string) => {
    setCurrentInput('');
    setError('');
    const updatedConversation = [...conversation, { question: currentQuestion, answer }];
    setConversation(updatedConversation);
    setIsThinking(true);
    if (updatedConversation.length >= maxQuestions) {
      setIsThinking(false);
      setReadiness(100);
      await generatePlan(updatedConversation, '');
      return;
    }
    const assessment = await getNextQuestion(updatedConversation);
    setReadiness(assessment.readiness);
    setIsThinking(false);
    if (assessment.readiness >= 70 || assessment.sufficient || !assessment.nextQuestion) {
      await generatePlan(updatedConversation, assessment.gaps);
    } else {
      setCurrentQuestion(assessment.nextQuestion);
    }
  };
  const generatePlan = async (finalConversation: QAPair[], gaps: string) => {
    setIsGenerating(true);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const conversationText = finalConversation.map((qa, i) => `Q${i + 1}: ${qa.question}\nA${i + 1}: ${qa.answer}`).join('\n\n');
    const planPrompt = `Generate a Mission Control plan as JSON only. No markdown, no explanation.
Based on this planning conversation:
${conversationText}
Make all milestones and revenue targets mathematically realistic based on the actual numbers the user provided. If numbers do not add up to the stated goal, adjust milestones to reflect what is actually achievable given the constraints.
Return exactly this JSON:
{"goalTitle":"short title","goalDescription":"one sentence","successDefinition":"what success looks like","startDate":"${today}","endDate":"${nextYear}","revenueGoal":"revenue goal if mentioned","constraint1":"main constraint","phases":[{"phaseNumber":1,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"},{"phaseNumber":2,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"},{"phaseNumber":3,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"}],"milestones":[{"id":"1","weekNumber":1,"weekStartDate":"YYYY-MM-DD","phase":"Phase 1 name","category":"Operations","milestone":"first milestone","kpiTarget":"metric","status":"Pending","notes":""},{"id":"2","weekNumber":4,"weekStartDate":"YYYY-MM-DD","phase":"Phase 1 name","category":"Revenue","milestone":"month 1","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"3","weekNumber":13,"weekStartDate":"YYYY-MM-DD","phase":"Phase 2 name","category":"Revenue","milestone":"quarter 1","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"4","weekNumber":26,"weekStartDate":"YYYY-MM-DD","phase":"Phase 3 name","category":"Revenue","milestone":"6 months","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"5","weekNumber":52,"weekStartDate":"YYYY-MM-DD","phase":"Phase 3 name","category":"Revenue","milestone":"12 months","kpiTarget":"success","status":"Pending","notes":""}]}`;
    const prePrompt = `You are Coach Marcus AI reviewing this plan. Give a direct honest premortem in 3 sentences. Name the specific numbers that do not add up. Name the biggest single risk. Name one thing that must be true for this plan to work. Be direct not motivational. Do not use the words trajectory, leverage, optimise, or paradigm.
Planning conversation:
${conversationText}
${gaps ? 'Information gaps identified: ' + gaps : ''}`;
    try {
      const [planRes, preRes] = await Promise.all([
        fetch('/.netlify/functions/generate-mission-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: planPrompt }) }),
        fetch('/.netlify/functions/generate-mission-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prePrompt }) })
      ]);
      const planResult = await planRes.json();
      const preResult = await preRes.json();
      const clean = (planResult.plan || '').replace(/```json|```/g, '').trim();
      const planData = JSON.parse(clean);
      const newPlan: MissionPlan = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        tier: 1,
        ...planData
      };
      await saveMissionPlan(userId, newPlan);
      update({ missionPlan: newPlan });
      setPremortемNote(preResult.plan || '');
      if (gaps) setInsufficientInfo(gaps);
      setMode('dashboard');
    } catch (err) {
      console.error('generatePlan error:', err);
      setError('Something went wrong. Please try again.');
      setIsGenerating(false);
    }
    setIsGenerating(false);
  };
  const updateMilestoneStatus = (id: string, status: 'Pending' | 'Done' | 'Moved') => {
    if (!plan) return;
    const updated = { ...plan, milestones: plan.milestones.map(m => m.id === id ? { ...m, status } : m) };
    update({ missionPlan: updated });
    saveMissionPlan(userId, updated);
  };
  if (mode === 'home') {
    return (
      <div className="flex flex-col gap-4 p-2">
        <div className="bg-[#0D2A4A] rounded-2xl p-6 text-center">
          <h2 className="text-xl font-black text-white uppercase tracking-wider mb-2">Mission Control</h2>
          <p className="text-[#9BB0C8] text-sm mb-6">Your personal progress tracker. Set your goal, track your milestones, stay on course.</p>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setMode('ai-setup'); setConversation([]); setCurrentQuestion('What is your main goal for the next 12 months? Include a specific number and a target date.'); setReadiness(0); setError(''); }}
              className="w-full bg-[#f78121] text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl">
              Coach Marcus AI builds my plan
            </button>
            <button onClick={() => setMode('upload')}
              className="w-full bg-[#1A3A5C] text-[#45D0D0] font-black uppercase tracking-widest text-sm py-4 rounded-xl border border-[#45D0D0]/30">
              I have a plan — upload it
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (mode === 'ai-setup') {
    return (
      <div className="flex flex-col gap-4 p-2">
        <div className="bg-[#0D2A4A] rounded-2xl p-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-black text-[#45D0D0] uppercase tracking-widest">Plan readiness</p>
            <p className="text-sm font-black text-[#f78121]">{readiness}%</p>
          </div>
          <div className="w-full h-2 bg-[#1A3A5C] rounded-full overflow-hidden mb-1">
            <div className="h-full bg-gradient-to-r from-[#f78121] to-[#45D0D0] rounded-full transition-all duration-700" style={{ width: `${readiness}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#9BB0C8] mb-6">
            <span>Question {conversation.length + 1} of {maxQuestions} max</span>
            <span>{readiness >= 70 ? 'Ready to build' : 'Building context...'}</span>
          </div>
          {isGenerating ? (
            <div className="text-center py-8">
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-[#f78121] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#f78121] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-[#f78121] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <p className="text-[#9BB0C8] text-sm">Building your Mission Control plan...</p>
            </div>
          ) : isThinking ? (
            <div className="text-center py-8">
              <div className="flex justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-[#45D0D0] rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-[#45D0D0] rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-[#45D0D0] rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <p className="text-[#9BB0C8] text-sm">Reviewing your answer...</p>
            </div>
          ) : (
            <>
              <p className="text-white text-base mb-6 leading-relaxed">{currentQuestion}</p>
              {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
              <textarea
                value={currentInput}
                onChange={e => setCurrentInput(e.target.value)}
                placeholder="Type your answer here..."
                rows={3}
                className="w-full bg-[#001b3d] border border-[#45D0D0]/30 rounded-xl p-4 text-white text-sm resize-none focus:outline-none focus:border-[#f78121] mb-4"
              />
              <button
                onClick={() => currentInput.trim() && handleAnswer(currentInput.trim())}
                disabled={!currentInput.trim()}
                className="w-full bg-[#f78121] text-white font-black uppercase tracking-widest text-sm py-4 rounded-xl disabled:opacity-40">
                Next
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
  if (mode === 'upload') {
    return (
      <div className="flex flex-col gap-4 p-2">
        <div className="bg-[#0D2A4A] rounded-2xl p-6 text-center">
          <p className="text-white font-black uppercase tracking-wider mb-2">Upload your plan</p>
          <p className="text-[#9BB0C8] text-sm mb-6">Download the Mission Control template, fill it in, and upload it here.</p>
          <p className="text-[#45D0D0] text-sm mb-4">Upload feature coming soon. Use Coach Marcus AI to build your plan for now.</p>
          <button onClick={() => setMode('home')} className="w-full bg-[#1A3A5C] text-white font-black uppercase text-sm py-4 rounded-xl">Back</button>
        </div>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-4 p-2">
      <div className="bg-[#0D2A4A] rounded-2xl p-5">
        <h2 className="text-lg font-black text-white uppercase tracking-wider mb-1">{plan?.goalTitle}</h2>
        <p className="text-[#9BB0C8] text-xs mb-4">{plan?.goalDescription}</p>
        <div className="flex justify-between text-xs text-[#9BB0C8] mb-2">
          <span>{completedCount} of {totalCount} milestones done</span>
          <span className="text-[#f78121] font-black">{progressPct}%</span>
        </div>
        <div className="w-full h-2 bg-[#1A3A5C] rounded-full overflow-hidden">
          <div className="h-full bg-[#f78121] rounded-full transition-all" style={{ width: `${progressPct}%` }} />
        </div>
      </div>
      {insufficientInfo && (
        <div className="bg-[#1A2F4A] rounded-2xl p-5 border-l-4 border-[#45D0D0]">
          <p className="text-xs font-black text-[#45D0D0] uppercase tracking-widest mb-2">Plan built with gaps</p>
          <p className="text-[#E0E8F0] text-sm leading-relaxed">This plan was built before all details were confirmed. Missing: {insufficientInfo}. Tap any milestone to update it as you get clarity.</p>
        </div>
      )}
      <div className="bg-[#0D2A4A] rounded-2xl p-5">
        <p className="text-xs font-black text-[#45D0D0] uppercase tracking-widest mb-3">Phases</p>
        {plan?.phases.map(ph => (
          <div key={ph.phaseNumber} className="mb-3 pb-3 border-b border-white/10 last:border-0">
            <p className="text-white text-sm font-black">{ph.phaseName}</p>
            <p className="text-[#9BB0C8] text-xs mt-1">{ph.phaseGoal}</p>
            <p className="text-[#f78121] text-xs mt-1">{ph.startDate} → {ph.endDate}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#0D2A4A] rounded-2xl p-5">
        <p className="text-xs font-black text-[#45D0D0] uppercase tracking-widest mb-3">Milestones</p>
        {plan?.milestones.map(m => (
          <div key={m.id} className="mb-3 pb-3 border-b border-white/10 last:border-0 flex items-start gap-3">
            <button onClick={() => updateMilestoneStatus(m.id, m.status === 'Done' ? 'Pending' : 'Done')}
              className={`mt-1 w-5 h-5 rounded-md border flex-shrink-0 flex items-center justify-center text-xs font-black ${m.status === 'Done' ? 'bg-[#45D0D0] border-[#45D0D0] text-[#001b3d]' : 'border-[#9BB0C8]'}`}>
              {m.status === 'Done' ? '✓' : ''}
            </button>
            <div className="flex-1">
              <p className={`text-sm ${m.status === 'Done' ? 'text-[#9BB0C8] line-through' : 'text-white'}`}>{m.milestone}</p>
              <p className="text-[#9BB0C8] text-xs mt-1">Week {m.weekNumber} · {m.category} · {m.kpiTarget}</p>
            </div>
          </div>
        ))}
      </div>
      {premortемNote && (
        <div className="bg-[#1A2F4A] rounded-2xl p-5 border-l-4 border-[#f78121]">
          <p className="text-xs font-black text-[#f78121] uppercase tracking-widest mb-3">Coach Marcus — Plan Review</p>
          <p className="text-[#E0E8F0] text-sm leading-relaxed">{premortемNote}</p>
        </div>
      )}
      <button onClick={() => { setMode('home'); update({ missionPlan: undefined }); setPremortемNote(''); setInsufficientInfo(''); }}
        className="w-full bg-[#1A3A5C] text-[#9BB0C8] font-black uppercase text-xs py-3 rounded-xl">
        Reset plan
      </button>
    </div>
  );
};
export default MissionControl;
