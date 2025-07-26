import React from 'react';
import { WaterDropIcon, MealIcon, WorkoutIcon, RestIcon } from './icons';

interface CurrentStatusProps {
  status: {
    type: string;
    message: string;
  };
}

const statusStyles: Record<string, { icon: React.ReactNode; bgColor: string; pulse: boolean }> = {
    'WORKOUT_ACTIVE': { icon: <WorkoutIcon className="w-8 h-8 text-rose-300" />, bgColor: 'from-rose-500/80 to-rose-700/80', pulse: true },
    'WORKOUT_PREP': { icon: <WorkoutIcon className="w-8 h-8 text-yellow-300" />, bgColor: 'from-yellow-500/80 to-yellow-700/80', pulse: true },
    'ACTION_NOW_WATER': { icon: <WaterDropIcon className="w-8 h-8 text-sky-300" />, bgColor: 'from-sky-500/80 to-sky-700/80', pulse: true },
    'ACTION_NOW_MEAL': { icon: <MealIcon className="w-8 h-8 text-amber-300" />, bgColor: 'from-amber-500/80 to-amber-700/80', pulse: true },
    'WATER_PREP': { icon: <WaterDropIcon className="w-8 h-8 text-sky-300" />, bgColor: 'from-sky-600/80 to-sky-800/80', pulse: false },
    'MEAL_PREP': { icon: <MealIcon className="w-8 h-8 text-amber-300" />, bgColor: 'from-amber-600/80 to-amber-800/80', pulse: false },
    'RESTING': { icon: <RestIcon className="w-8 h-8 text-emerald-300" />, bgColor: 'from-emerald-500/80 to-emerald-700/80', pulse: false },
    'DEFAULT': { icon: <RestIcon className="w-8 h-8 text-slate-300" />, bgColor: 'from-slate-600/80 to-slate-800/80', pulse: false },
};

export const CurrentStatus: React.FC<CurrentStatusProps> = ({ status }) => {
  const { icon, bgColor, pulse } = statusStyles[status.type] || statusStyles['DEFAULT'];

  return (
    <div className={`flex items-center p-6 rounded-2xl bg-gradient-to-br ${bgColor} shadow-2xl transition-all duration-500`}>
      <div className={`flex-shrink-0 mr-5 ${pulse ? 'animate-pulse' : ''}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight">{status.message}</h2>
      </div>
    </div>
  );
};