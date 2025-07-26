import React from 'react';
import { SpeakerOnIcon, SpeakerOffIcon } from './icons';

interface HeaderProps {
  currentTime: Date;
  isAudioEnabled: boolean;
  toggleAudio: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentTime, isAudioEnabled, toggleAudio }) => {
  return (
    <header className="flex items-center justify-between p-4 md:p-6 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <img src="https://success0.fr.to/logo.png" alt="Logo" className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-slate-700" />
        <div>
          <h1 className="text-lg md:text-xl font-bold text-white">Success Developer</h1>
          <p className="text-sm text-slate-400">Bharatpur, Nepal</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={toggleAudio} className="p-2 rounded-full hover:bg-slate-700 transition-colors" aria-label="Toggle sound">
          {isAudioEnabled ? <SpeakerOnIcon className="w-6 h-6 text-slate-300" /> : <SpeakerOffIcon className="w-6 h-6 text-slate-500" />}
        </button>
        <div className="text-right">
          <div className="text-2xl md:text-3xl font-black text-white tracking-wider tabular-nums">
            {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}
          </div>
          <div className="text-xs text-slate-500">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>
    </header>
  );
};
