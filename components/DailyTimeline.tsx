import React from 'react';
import { ScheduleEvent, EventType } from '../lib/types';
import { WaterDropIcon, MealIcon, WorkoutIcon } from './icons';
import { timeToMinutes } from '../hooks/useScheduleLogic';

interface DailyTimelineProps {
  events: ScheduleEvent[];
  currentTime: Date;
}

const IconMap: Record<EventType, React.ReactNode> = {
  [EventType.WATER]: <WaterDropIcon className="w-4 h-4 text-sky-400" />,
  [EventType.MEAL]: <MealIcon className="w-4 h-4 text-amber-400" />,
  [EventType.WORKOUT]: <WorkoutIcon className="w-4 h-4 text-rose-500" />,
};

const formatTime12Hour = (time: [number, number]): string => {
    let [hour, minute] = time;
    const ampm = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12;
    hour = hour || 12; // The hour '0' should be '12'
    const minuteStr = String(minute).padStart(2, '0');
    return `${hour}:${minuteStr} ${ampm}`;
}

export const DailyTimeline: React.FC<DailyTimelineProps> = ({ events, currentTime }) => {
  const totalMinutesInDay = 24 * 60;
  const currentMinute = timeToMinutes([currentTime.getHours(), currentTime.getMinutes()]);
  const progressPercent = (currentMinute / totalMinutesInDay) * 100;

  return (
    <div className="bg-slate-800/50 p-4 rounded-xl shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-slate-300">Daily Timeline</h2>
      <div className="relative w-full h-10">
        {/* Background track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-2 bg-slate-700 rounded-full" />
        
        {/* Progress track */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-2 bg-emerald-500 rounded-full"
          style={{ width: `${progressPercent}%` }}
        />

        {/* Current time indicator */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-emerald-500 shadow-lg"
          style={{ left: `calc(${progressPercent}% - 8px)` }}
        >
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-slate-600 text-white text-xs rounded-md shadow">
            Now
          </div>
        </div>

        {/* Event markers */}
        {events.map(event => {
          const eventMinute = timeToMinutes(event.time);
          const leftPercent = (eventMinute / totalMinutesInDay) * 100;
          const isPast = eventMinute < currentMinute;
          
          if (event.type === EventType.WORKOUT && event.endTime) {
            const endMinute = timeToMinutes(event.endTime);
            const widthPercent = ((endMinute - eventMinute) / totalMinutesInDay) * 100;
            const isWorkoutPast = endMinute < currentMinute;
            return (
              <div 
                key={event.id}
                className={`absolute top-1/2 -translate-y-1/2 h-4 bg-rose-500/50 rounded-md transition-opacity ${isWorkoutPast ? 'opacity-30' : ''}`}
                style={{ left: `${leftPercent}%`, width: `${widthPercent}%` }}
                title={`Workout: ${formatTime12Hour(event.time)} - ${formatTime12Hour(event.endTime)}`}
              />
            )
          }

          return (
            <div
              key={event.id}
              className={`absolute top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-800 border-2 border-slate-600 transition-opacity ${isPast ? 'opacity-30' : ''}`}
              style={{ left: `calc(${leftPercent}% - 10px)` }}
              title={`${event.type} at ${formatTime12Hour(event.time)}`}
            >
              <div className={isPast ? 'opacity-50' : ''}>
                {IconMap[event.type]}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};