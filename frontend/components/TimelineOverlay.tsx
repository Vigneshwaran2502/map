import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimelineOverlayProps {
    year: number;
    isVisible: boolean;
    minYear: number;
    maxYear: number;
}

export const TimelineOverlay: React.FC<TimelineOverlayProps> = ({ year, isVisible, minYear, maxYear }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 bg-gray-900/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl z-[1000] flex items-center gap-8 text-white min-w-[400px]"
                >
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-400 mb-1">
                            Animation Timeline
                        </span>
                        <div className="text-3xl font-black tracking-tighter transition-all duration-300 tabular-nums">
                            {year}
                        </div>
                    </div>

                    <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)]"
                            animate={{
                                width: `${((year - minYear) / (maxYear - minYear)) * 100}%`
                            }}
                            transition={{ ease: "linear", duration: 0.5 }}
                        />
                    </div>

                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-gray-400">
                        <div className={`w-1.5 h-1.5 rounded-full ${year === maxYear ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`}></div>
                        {year === maxYear ? 'Complete' : 'Live Deck'}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
