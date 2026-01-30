import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight } from 'lucide-react';

interface TimeSliderProps {
    years: number[];
    selectedYear: number;
    onYearChange: (year: number) => void;
    isPlaying: boolean;
    onTogglePlay: () => void;
}

export const TimeSlider: React.FC<TimeSliderProps> = ({ years, selectedYear, onYearChange, isPlaying, onTogglePlay }) => {
    return (
        <div className="w-full bg-gray-900/80 border-t border-gray-800 backdrop-blur-xl p-4 flex items-center gap-6">
            <button
                onClick={onTogglePlay}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all shadow-lg
          ${isPlaying ? 'bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30' : 'bg-cyan-500/20 text-cyan-500 border border-cyan-500/50 hover:bg-cyan-500/30'}
        `}
            >
                {isPlaying ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-1" />}
            </button>

            <div className="flex-1 relative h-12 flex items-center">
                {/* Track */}
                <div className="absolute left-0 right-0 h-1 bg-gray-800 rounded-full overflow-hidden">
                    {/* Progress */}
                    <div
                        className="h-full bg-gradient-to-r from-cyan-900 to-cyan-500"
                        style={{ width: `${((selectedYear - years[0]) / (years[years.length - 1] - years[0])) * 100}%` }}
                    />
                </div>

                {/* Ticks & Labels */}
                <div className="w-full flex justify-between relative z-10">
                    {years.map((year) => (
                        <div
                            key={year}
                            className="flex flex-col items-center cursor-pointer group"
                            onClick={() => onYearChange(year)}
                        >
                            <div className={`w-3 h-3 rounded-full border-2 transition-all duration-300
                ${year === selectedYear ? 'bg-cyan-500 border-cyan-300 scale-125 shadow-[0_0_10px_rgba(6,182,212,0.5)]' :
                                    year < selectedYear ? 'bg-cyan-900 border-cyan-800' : 'bg-gray-800 border-gray-600 group-hover:bg-gray-700'}
              `} />
                            <span className={`mt-3 text-[10px] font-bold transition-colors
                ${year === selectedYear ? 'text-cyan-400' : 'text-gray-600 group-hover:text-gray-400'}
              `}>
                                {year}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-gray-500 tracking-widest">Current View</div>
                <div className="text-2xl font-black text-white font-mono">{selectedYear}</div>
            </div>
        </div>
    );
};
