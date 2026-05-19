
import React, { useRef } from 'react';
import { UserData } from '../types';
import VisionNavigator from './VisionNavigator';
import GoalMaster from './GoalMaster';
import HabitLaboratory from './HabitLaboratory';

interface Props {
  data: UserData;
  update: (u: Partial<UserData>) => void;
  isGuest: boolean;
  onRestricted: () => void;
  isMobileMode: boolean;
  onNavigateToCoach: () => void;
}

const FoundationView: React.FC<Props> = ({ data, update, isGuest, onRestricted, onNavigateToCoach }) => {
  const lifeCircleRef = useRef<HTMLDivElement>(null);

  return (
    <div className="space-y-12 pb-20">

      <section className="rounded-2xl bg-white/5 border border-white/10 p-6 text-center space-y-5">
        <h2 className="text-xl font-bold text-white tracking-wide">Where would you like to start?</h2>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={onNavigateToCoach}
            className="px-6 py-3 rounded-xl bg-[#f78121] text-white font-bold text-sm uppercase tracking-widest hover:bg-[#f78121]/80 transition-colors"
          >
            Talk to Coach Marcus AI
          </button>
          <button
            onClick={() => lifeCircleRef.current?.scrollIntoView({ behavior: 'smooth' })}
            className="px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-bold text-sm uppercase tracking-widest hover:bg-white/15 transition-colors"
          >
            Set up my journey
          </button>
        </div>
      </section>

      <section ref={lifeCircleRef} className="relative">
        <VisionNavigator 
          data={data} 
          update={update} 
          isGuest={isGuest} 
          onRestricted={onRestricted} 
        />
      </section>
      
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-10" />
      
      <section>
        <GoalMaster data={data} update={update} />
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-10" />

      <section>
        <HabitLaboratory data={data} update={update} />
      </section>
    </div>
  );
};

export default FoundationView;
