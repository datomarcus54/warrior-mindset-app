
import React from 'react';
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
}

const FoundationView: React.FC<Props> = ({ data, update, isGuest, onRestricted }) => {
  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <section className="relative">
        <VisionNavigator 
          data={data} 
          update={update} 
          isGuest={isGuest} 
          onRestricted={onRestricted} 
        />
      </section>
      
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-10" />
      
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-200">
        <GoalMaster data={data} update={update} />
      </section>
      
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mx-10" />
      
      <section className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-300">
        <HabitLaboratory data={data} update={update} />
      </section>
    </div>
  );
};

export default FoundationView;
