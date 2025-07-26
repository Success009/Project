import React, { useState, useEffect } from 'react';

interface TimeControllerProps {
  currentTime: Date;
  setCurrentTime: (newTime: Date) => void;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

// Utility to format date for datetime-local input
const toDateTimeLocal = (date: Date) => {
    const ten = (i: number) => (i < 10 ? '0' : '') + i;
    return `${date.getFullYear()}-${ten(date.getMonth() + 1)}-${ten(date.getDate())}T${ten(date.getHours())}:${ten(date.getMinutes())}`;
};

export const TimeController: React.FC<TimeControllerProps> = ({ currentTime, setCurrentTime, isPaused, setIsPaused }) => {
    const [sliderValue, setSliderValue] = useState(0);

    useEffect(() => {
        setSliderValue(currentTime.getHours() * 60 + currentTime.getMinutes());
    }, [currentTime]);

    const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const totalMinutes = parseInt(e.target.value, 10);
        const newTime = new Date(currentTime);
        newTime.setHours(Math.floor(totalMinutes / 60), totalMinutes % 60, 0, 0);
        setCurrentTime(newTime);
    };
    
    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = new Date(e.target.value);
        setCurrentTime(newTime);
    };

    const timeStep = (minutes: number) => {
        const newTime = new Date(currentTime.getTime() + minutes * 60 * 1000);
        setCurrentTime(newTime);
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-sm p-3 shadow-2xl z-50 border-t border-slate-700">
            <div className="max-w-4xl mx-auto">
                <div className="text-center text-xs font-bold text-yellow-300 mb-2">TIME CONTROLLER (DEBUG)</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                    {/* Time Slider */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm font-mono text-slate-400">00:00</span>
                        <input
                            type="range"
                            min="0"
                            max="1439" // 24 * 60 - 1
                            value={sliderValue}
                            onChange={handleSliderChange}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                        />
                         <span className="text-sm font-mono text-slate-400">23:59</span>
                    </div>

                    {/* Precise Controls */}
                    <div className="flex items-stretch justify-center md:justify-end gap-2">
                        <input 
                            type="datetime-local" 
                            value={toDateTimeLocal(currentTime)}
                            onChange={handleDateTimeChange}
                            className="bg-slate-700 text-slate-200 border border-slate-600 rounded-md px-2 text-sm"
                        />
                         <button onClick={() => setIsPaused(!isPaused)} className={`px-3 py-1 text-sm font-bold rounded-md ${isPaused ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'}`}>
                            {isPaused ? '▶ Play' : '❚❚ Pause'}
                        </button>
                        <button onClick={() => timeStep(1)} className="px-3 py-1 text-sm font-bold rounded-md bg-sky-600 hover:bg-sky-500">
                            +1m
                        </button>
                        <button onClick={() => timeStep(10)} className="px-3 py-1 text-sm font-bold rounded-md bg-sky-600 hover:bg-sky-500">
                            +10m
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
