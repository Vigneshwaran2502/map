import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause } from 'lucide-react';

export const PrecisionTimeline = ({
    timelineData,
    currentYear,
    isPlaying,
    onTogglePlay,
    onYearChange,
    baselineYear
}) => {

    // Calculate progress (2010 -> 2025)
    // Image says "Temporal Analysis: 2010 - 2025"
    // currentYear typically ranges 2013-2024 in data, but slider should cover full range
    const minYear = 2010;
    const maxYear = 2025;
    const progress = Math.min(100, Math.max(0, ((currentYear - minYear) / (maxYear - minYear)) * 100));

    return (
        <div className="absolute bottom-6 left-6 right-6 z-[400]">
            <div className="w-full bg-[#0f172a]/90 border border-gray-800 backdrop-blur-xl rounded-2xl p-4 shadow-2xl relative overflow-hidden group">

                <div className="flex justify-between items-center mb-2 px-1">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Temporal Analysis: {minYear} - {maxYear}</span>
                    <button
                        onClick={onTogglePlay}
                        className="flex items-center gap-2 text-[10px] font-bold text-gray-500 hover:text-cyan-400 transition-colors uppercase"
                    >
                        {isPlaying ? 'Pause Simulation' : 'Run Simulation'}
                    </button>
                </div>

                {/* Track */}
                <div className="relative h-2 bg-gray-800 rounded-full mt-4 mb-2 cursor-pointer" onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const p = x / rect.width;
                    onYearChange(minYear + (p * (maxYear - minYear)));
                }}>
                    {/* Tick Marks (Vertical lines) */}
                    <div className="absolute inset-0 flex justify-between px-1 pointer-events-none">
                        {Array.from({ length: 16 }, (_, i) => minYear + i).map(year => (
                            <div key={year} className="h-full w-[1px] bg-gray-700/50" />
                        ))}
                    </div>

                    {/* Active Bar Gradient - Cyan to Red? Or Just Cyan? Image is Cyan */}
                    <div
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-cyan-900 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Thumb with Label */}
                    <div
                        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-cyan-500 bg-[#0f172a] flex items-center justify-center shadow-lg transition-all duration-100 ease-linear z-10"
                        style={{ left: `${progress}%`, transform: `translate(-50%, -50%)` }}
                    >
                        {/* Play icon inside thumb if paused? Or Just ring */}
                        <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />

                        {/* Floating Year Label above thumb */}
                        <div className="absolute -top-10 bg-[#0f172a] border border-gray-700 text-cyan-400 text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
                            {Math.floor(currentYear)}
                        </div>
                    </div>
                </div>

                {/* Years Labels */}
                <div className="flex justify-between px-1 mt-1 text-[8px] font-mono text-gray-600">
                    {Array.from({ length: 16 }, (_, i) => minYear + i).map(year => (
                        <span key={year}>{year}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};
