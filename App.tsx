import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { CurrentStatus } from './components/CurrentStatus';
import { NextUp } from './components/NextUp';
import { DailyTimeline } from './components/DailyTimeline';
import { WorkoutTracker } from './components/WorkoutTracker';
import { OptionalWorkoutPrompt } from './components/OptionalWorkoutPrompt';
// import { TimeController } from './components/TimeController'; // Time controller is disabled for now.
import { useScheduleLogic } from './hooks/useScheduleLogic';
import type { OptionalVupStatus } from './hooks/useScheduleLogic';
import { useAudioFeedback } from './hooks/useAudioFeedback';

const App: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // --- Time Controller Logic (Disabled) ---
  // To re-enable, uncomment the following lines and the TimeController component at the bottom.
  // const [realTime, setRealTime] = useState(new Date());
  // const [debugTime, setDebugTime] = useState<Date | null>(null);
  // const [isTimePaused, setIsTimePaused] = useState(true);
  // const [isDebugging, setIsDebugging] = useState(false);
  // const currentTime = isDebugging && debugTime ? debugTime : realTime;
  // --- End of Disabled Logic ---

  // The main clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      // In normal mode, just use the real time.
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);
  
  const { status, activeWorkout, nextTasks, allDayEvents, optionalVupStatus } = useScheduleLogic(currentTime);
  const { isAudioEnabled, toggleAudio, speak, vibrate } = useAudioFeedback();

  // Effect to trigger audio/vibration for global status changes
  const prevStatusType = useRef<string | null>(null);
  useEffect(() => {
      if (status.type !== prevStatusType.current) {
          switch (status.type) {
              case 'ACTION_NOW_WATER':
                  speak('Drink water now');
                  vibrate([200, 100, 200]); // Double vibration
                  break;
              case 'ACTION_NOW_MEAL':
                  speak('Time to eat');
                  vibrate([200, 100, 200]);
                  break;
              case 'WORKOUT_PREP':
              case 'MEAL_PREP':
              case 'WATER_PREP':
                  speak(status.message);
                  vibrate(100); // Short vibration
                  break;
          }
          prevStatusType.current = status.type;
      }
  }, [status, speak, vibrate]);

  // Effect to trigger audio/vibration for optional challenges
  const prevOptionalVupState = useRef<OptionalVupStatus['state'] | null>(null);
  useEffect(() => {
    if (optionalVupStatus.state === 'PROMPT' && prevOptionalVupState.current !== 'PROMPT') {
      speak('An optional challenge is now available.');
      vibrate([250, 100, 250]);
    }
    prevOptionalVupState.current = optionalVupStatus.state;
  }, [optionalVupStatus, speak, vibrate]);

  // --- Time Controller Handlers (Disabled) ---
  // const handleSetDebugTime = (newTime: Date) => {
  //   if(isDebugging) setDebugTime(newTime);
  // }
  // const handleToggleDebugMode = () => {
  //   const willBeDebugging = !isDebugging;
  //   setIsDebugging(willBeDebugging);
  //   if (willBeDebugging) {
  //     setDebugTime(realTime);
  //     setIsTimePaused(true);
  //   } else {
  //     setDebugTime(null);
  //   }
  // };
  // --- End of Disabled Handlers ---

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col pb-32">
      <Header 
        currentTime={currentTime} 
        isAudioEnabled={isAudioEnabled} 
        toggleAudio={toggleAudio}
      />
      <main className="flex-grow p-4 md:p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {activeWorkout ? (
            <WorkoutTracker 
              workout={activeWorkout} 
              currentTime={currentTime}
              speak={speak}
              vibrate={vibrate}
            />
          ) : (
            <div className="space-y-6 animate-fade-in">
              <CurrentStatus status={status} />
              <OptionalWorkoutPrompt status={optionalVupStatus} />
              <NextUp tasks={nextTasks} currentTime={currentTime} />
              <DailyTimeline events={allDayEvents} currentTime={currentTime} />
            </div>
          )}
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>Stay focused, stay consistent. You've got this, Success!</p>
        {/* Time Controller button is disabled for now.
        <button 
          onClick={handleToggleDebugMode}
          className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-yellow-300 rounded-md text-xs font-bold transition-colors"
        >
          Time Controller
        </button>
        */}
      </footer>
      {/* Time Controller component is disabled for now.
      {isDebugging && (
        <TimeController 
          currentTime={currentTime}
          setCurrentTime={handleSetDebugTime}
          isPaused={isTimePaused}
          setIsPaused={setIsTimePaused}
        />
      )}
      */}
    </div>
  );
};

export default App;
