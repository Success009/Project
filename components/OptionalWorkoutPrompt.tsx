import React from 'react';
import { optionalVupExercise } from '../lib/scheduleData';
import type { OptionalVupStatus } from '../hooks/useScheduleLogic';
import { WorkoutIcon } from './icons';

interface OptionalWorkoutPromptProps {
  status: OptionalVupStatus;
}

export const OptionalWorkoutPrompt: React.FC<OptionalWorkoutPromptProps> = ({ status }) => {

  if (status.state === 'INACTIVE') {
    return null;
  }

  if (status.state === 'PROMPT') {
    return (
      <div className="bg-gradient-to-br from-teal-500/80 to-teal-700/80 p-4 rounded-xl shadow-lg flex items-center justify-between gap-4 animate-fade-in">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-2 rounded-full">
            <WorkoutIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Optional Challenge Available</h3>
            <p className="text-white/90">{optionalVupExercise.sets} set of {optionalVupExercise.reps} {optionalVupExercise.name}</p>
          </div>
        </div>
      </div>
    );
  }

  if (status.state === 'COUNTDOWN' && status.countdownMinutes) {
    const hours = Math.floor(status.countdownMinutes / 60);
    const minutes = Math.ceil(status.countdownMinutes % 60);
    
    return (
       <div className="bg-slate-800/50 p-3 rounded-xl flex items-center justify-center gap-3 text-center">
            <p className="text-slate-400 text-sm">Next optional challenge in:</p>
            <p className="text-lg font-bold text-slate-200 tabular-nums">
                {hours > 0 && `${hours}h `}{minutes}m
            </p>
       </div>
    );
  }

  return null;
};