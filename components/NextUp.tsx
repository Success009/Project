import React from 'react';
import { ScheduleEvent, EventType } from '../lib/types';
import { WaterDropIcon, MealIcon, WorkoutIcon } from './icons';

interface NextUpProps {
  tasks: {
    water?: ScheduleEvent & { date: Date };
    meal?: ScheduleEvent & { date: Date };
    workout?: ScheduleEvent & { date: Date };
  };
  currentTime: Date;
}

const Countdown: React.FC<{ targetDate: Date; currentTime: Date }> = ({ targetDate, currentTime }) => {
  const diff = targetDate.getTime() - currentTime.getTime();
  if (diff < 0) return <span>Now</span>;

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return <span className="tabular-nums">{`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`}</span>;
};


const NextTaskCard: React.FC<{
  task?: ScheduleEvent & { date: Date };
  currentTime: Date;
  icon: React.ReactNode;
  title: string;
  bgColor: string;
}> = ({ task, currentTime, icon, title, bgColor }) => {
    if (!task) {
        return (
            <div className={`p-4 rounded-lg flex flex-col items-center justify-center text-center bg-slate-800/50`}>
                <div className="text-2xl mb-2">🎉</div>
                <h3 className="font-bold text-slate-300">{title}</h3>
                <p className="text-sm text-slate-400">All done!</p>
            </div>
        )
    }

    const taskDate = new Date(task.date);
    taskDate.setHours(task.time[0], task.time[1], 0, 0);

  return (
    <div className={`p-4 rounded-lg flex flex-col bg-gradient-to-br ${bgColor}`}>
      <div className="flex items-center justify-between text-white mb-2">
        <h3 className="font-bold">{title}</h3>
        {icon}
      </div>
      <div className="text-2xl font-black text-white">
        <Countdown targetDate={taskDate} currentTime={currentTime} />
      </div>
      <p className="text-sm text-white/80 mt-1 truncate">
        {typeof task.details === 'string' ? task.details : `Workout - ${task.details[0].name}`}
      </p>
    </div>
  );
};

export const NextUp: React.FC<NextUpProps> = ({ tasks, currentTime }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-slate-300">What's Next?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NextTaskCard
          task={tasks.water}
          currentTime={currentTime}
          icon={<WaterDropIcon className="w-6 h-6" />}
          title="Next Water"
          bgColor="from-sky-600 to-sky-800"
        />
        <NextTaskCard
          task={tasks.meal}
          currentTime={currentTime}
          icon={<MealIcon className="w-6 h-6" />}
          title="Next Meal"
          bgColor="from-amber-600 to-amber-800"
        />
        <NextTaskCard
          task={tasks.workout}
          currentTime={currentTime}
          icon={<WorkoutIcon className="w-6 h-6" />}
          title="Next Workout"
          bgColor="from-rose-600 to-rose-800"
        />
      </div>
    </div>
  );
};