import React, { useState } from 'react';
import { UserData, MissionPlan } from '../types';
import { saveMissionPlan } from '../services/missionPlanService';
interface Props {
  data: UserData;
  update: (updates: Partial<UserData>) => void;
  userId: string;
}
const QUESTIONS = [
  "What is your main goal for the next 12 months? Include a number and a date.",
  "What does success look like on the last day? Be specific — revenue, clients, lifestyle.",
  "What is your biggest constraint right now? Budget, time, health, or anything else.",
  "What is the one number you will track every week to know you are on track?",
  "What is your first milestone — the one thing to achieve in the next 30 days?"
];
const MissionControl: React.FC<Props> = ({ data, update, userId }) => {
  const [mode, setMode] = useState<'home' | 'ai-setup' | 'upload' | 'dashboard'>(
    data.missionPlan?.goalTitle ? 'dashboard' : 'home'
  );
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [followUpQuestion, setFollowUpQuestion] = useState('');
  const [followUpAnswers, setFollowUpAnswers] = useState<string[]>([]);
  const [isFollowUp, setIsFollowUp] = useState(false);
  const [currentInput, setCurrentInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingFollowUp, setIsCheckingFollowUp] = useState(false);
  const [premortемNote, setPremortемNote] = useState('');
  const [error, setError] = useState('');
  const plan = data.missionPlan;
  const completedCount = plan?.milestones.filter(m => m.status === 'Done').length || 0;
  const totalCount = plan?.milestones.length || 0;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const detectFollowUp = async (questionIndex: number, answer: string): Promise<string> => {
    const followUpPrompt = `You are reviewing a user answer to a goal-planning question. Detect if a critical number is missing. Return one follow-up question or return exactly: NONE
Question: "${QUESTIONS[questionIndex]}"
Answer: "${answer}"
Rules: if user mentions subscribers but no price ask price. If workshops but no participant count ask capacity. If revenue target but only one income stream that cannot reach it ask about other streams. If health or sleep constraint ask realistic hours per day available. Return only the question text or NONE.`;
    try {
      const res = await fetch('/.netlify/functions/generate-mission-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: followUpPrompt })
      });
      const result = await res.json();
      const detected = (result.plan || '').trim();
      return detected === 'NONE' ? '' : detected;
    } catch {
      return '';
    }
  };
  const handleAnswer = async (answer: string) => {
    setCurrentInput('');
    if (isFollowUp) {
      const newFollowUps = [...followUpAnswers, answer];
      setFollowUpAnswers(newFollowUps);
      setIsFollowUp(false);
      setFollowUpQuestion('');
      if (step < QUESTIONS.length - 1) {
        setStep(step + 1);
      } else {
        await generatePlan(answers, newFollowUps);
      }
      return;
    }
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    setIsCheckingFollowUp(true);
    const followUp = await detectFollowUp(step, answer);
    setIsCheckingFollowUp(false);
    if (followUp) {
      setFollowUpQuestion(followUp);
      setIsFollowUp(true);
    } else if (step < QUESTIONS.length - 1) {
      setStep(step + 1);
    } else {
      await generatePlan(newAnswers, followUpAnswers);
    }
  };
  const generatePlan = async (finalAnswers: string[], extraContext: string[]) => {
    setIsGenerating(true);
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const ctx = extraContext.length > 0 ? '\nExtra context:\n' + extraContext.join('\n') : '';
    const planPrompt = `Generate a Mission Control plan as JSON only. No markdown, no explanation.
Goal: ${finalAnswers[0]}
Success: ${finalAnswers[1]}
Constraint: ${finalAnswers[2]}
Weekly metric: ${finalAnswers[3]}
First milestone: ${finalAnswers[4]}${ctx}
Use extra context to make milestones mathematically realistic.
Return exactly: {"goalTitle":"title","goalDescription":"one sentence","successDefinition":"success","startDate":"${today}","endDate":"${nextYear}","revenueGoal":"revenue if mentioned","constraint1":"constraint","phases":[{"phaseNumber":1,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"},{"phaseNumber":2,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"},{"phaseNumber":3,"phaseName":"name","startDate":"YYYY-MM-DD","endDate":"YYYY-MM-DD","phaseGoal":"goal","successMeasure":"measure"}],"milestones":[{"id":"1","weekNumber":1,"weekStartDate":"YYYY-MM-DD","phase":"Phase 1 name","category":"Operations","milestone":"first milestone","kpiTarget":"metric","status":"Pending","notes":""},{"id":"2","weekNumber":4,"weekStartDate":"YYYY-MM-DD","phase":"Phase 1 name","category":"Revenue","milestone":"month 1","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"3","weekNumber":13,"weekStartDate":"YYYY-MM-DD","phase":"Phase 2 name","category":"Revenue","milestone":"quarter 1","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"4","weekNumber":26,"weekStartDate":"YYYY-MM-DD","phase":"Phase 3 name","category":"Revenue","milestone":"6 months","kpiTarget":"outcome","status":"Pending","notes":""},{"id":"5","weekNumber":52,"weekStartDate":"YYYY-MM-DD","phase":"Phase 3 name","category":"Revenue","milestone":"12 months","kpiTarget":"success","status":"Pending","notes":""}]}`;
    const prePrompt = `You are Coach Marcus AI. Give a direct honest premortem in 3 sentences. Name the specific numbers that do not add up. Name the biggest risk. Name one thing that must be true for this plan to work. Be direct not motivational.
Goal: ${finalAnswers[0]}
Success: ${finalAnswers[1]}
Constraint: ${finalAnswers[2]}
Weekly metric: ${finalAnswers[3]}
First milestone: ${finalAnswers[4]}${ctx}`;
    try {
      const [planRes, preRes] = await Promise.all([
        fetch('/.netlify/functions/generate-mission-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: planPrompt }) }),
        fetch('/.netlify/functions/generate-mission-plan', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt: prePrompt }) })
      ]);
      const planResult = await planRes.json();
      const preResult = await preRes.json();
      const planData = JSON.parse(planResult.plan);
      const newPlan: MissionPlan = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), tier: 1, ...planData };
      await saveMissionPlan(userId, newPlan);
      update({ missionPlan: newPlan });
      setPremortемNote(preResult.plan || '');
      setMode('dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
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
            <button onClick={() => { setMode('ai-setup'); setStep(0); setAnswers([]); setFollowUpAnswers([]); setIsFollowUp(false); setFollowUpQuestion(''); }}
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
    const currentQuestion = isFollowUp ? followUpQuestion : QUESTIONS[step];
    const questionLabel = isFollowUp ? 'Follow-up' : `Question ${step + 1} of ${QUESTIONS.length}`;
    return (
      <div className="flex flex-col gap-4 p-2">
        <div className="bg-[#0D2A4A] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-6">
            {QUESTIONS.map((_, i) => (
              <div key={i} className={`flex-1 h-1 rounded-full ${i < step ? 'bg-[#f78121]' : i === step ? 'bg-[#45D0D0]' : 'bg-[#1A3A5C]'}`} />
            ))}
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
          ) : isCheckingFollowUp ? (
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
              <p className="text-sm font-black text-[#45D0D0] uppercase tracking-widest mb-2">{questionLabel}</p>
              {isFollowUp && <p className="text-xs text-[#f78121] mb-3">One more detail needed to make your plan realistic.</p>}
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
                {(!isFollowUp && step === QUESTIONS.length - 1) ? 'Build my plan' : 'Next'}
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
      <button onClick={() => { setMode('home'); update({ missionPlan: undefined }); }}
        className="w-full bg-[#1A3A5C] text-[#9BB0C8] font-black uppercase text-xs py-3 rounded-xl">
        Reset plan
      </button>
    </div>
  );
};
export default MissionControl;
