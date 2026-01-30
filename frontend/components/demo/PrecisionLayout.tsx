import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers, Map as MapIcon, Globe, Info, Maximize2, Search, Compass,
    Wind, Droplets, Mountain, Waves
} from 'lucide-react';
import { PrecisionMetrics } from './PrecisionMetrics';
import { PrecisionTimeline } from './PrecisionTimeline';
import { DEMO_CONFIG, METRICS, TIMELINE_DATA } from '../../data/precisionDemoData';

// Left Panel: Layers & Filters
const LayersPanel = () => (
    <div className="absolute bottom-24 left-6 w-64 bg-[#0f172a]/90 border border-gray-800 backdrop-blur-xl rounded-xl p-4 shadow-2xl z-[400]">
        <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3 border-b border-gray-800 pb-2">Layers & Filters</h3>

        <div className="space-y-4">
            {/* Data Sources */}
            <div className="space-y-2">
                <div className="text-[10px] text-gray-500 font-bold uppercase">Data Sources</div>
                <div className="flex flex-col gap-1">
                    <label className="flex items-center gap-2 text-xs text-cyan-400 font-bold bg-cyan-950/30 p-2 rounded border border-cyan-900/50 cursor-pointer">
                        <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_5px_cyan]" />
                        Satellite
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-500 p-2 cursor-pointer hover:text-gray-300">
                        <div className="w-2 h-2 rounded-full border border-gray-600" />
                        Buoy
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-500 p-2 cursor-pointer hover:text-gray-300">
                        <div className="w-2 h-2 rounded-full border border-gray-600" />
                        Drone
                    </label>
                </div>
            </div>

            {/* Collapsibles */}
            {['Risk Thresholds', 'Environment Factors'].map(label => (
                <div key={label} className="p-2 border border-gray-800 rounded bg-gray-900/50 flex justify-between items-center cursor-pointer hover:border-gray-700">
                    <span className="text-[10px] text-gray-400">{label}</span>
                    <span className="text-gray-600">▼</span>
                </div>
            ))}
        </div>
    </div>
);

// Floating Context Popup (Map Overlay)
const ContextPopup = ({ config }) => (
    <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute top-1/3 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-[320px] bg-[#020617]/95 border border-gray-700 rounded-xl overflow-hidden shadow-2xl z-[350]"
    >
        {/* Header */}
        <div className="bg-[#0f172a] p-2 border-b border-gray-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Contextual Analysis:</span>
                <span className="text-xs font-bold text-white">Segment A-12</span>
            </div>
            <button className="text-gray-500 hover:text-white">✕</button>
        </div>

        <div className="p-3">
            <div className="text-[9px] font-mono text-gray-500 mb-2">Lat: {config.location.lat.toFixed(4)}° N, Long: {config.location.lng.toFixed(4)}° W</div>

            <div className="grid grid-cols-2 gap-2">
                {/* Mini Map Placeholder */}
                <div className="h-24 bg-gray-900 rounded border border-gray-800 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://c0.wallpaperflare.com/preview/324/539/22/google-earth-view-satellite-earth-map.jpg')] bg-cover bg-center opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    {/* Red Zone Overlay */}
                    <div className="absolute top-2 left-2 w-12 h-16 bg-red-500/30 border border-red-500 rotate-12 glow-box-red" />
                </div>

                {/* Stats */}
                <div className="flex flex-col justify-between">
                    <div>
                        <div className="text-[8px] uppercase text-gray-500 font-bold">Current Status</div>
                        <div className="text-xs font-black text-red-500 animate-pulse">CRITICAL</div>
                    </div>
                    <div className="my-1 h-[1px] bg-gray-800" />
                    <div>
                        <div className="text-[8px] uppercase text-gray-500 font-bold">Erosion Rate</div>
                        <div className="text-xs text-white">2.5m / Year</div>
                    </div>
                    <div className="my-1 h-[1px] bg-gray-800" />
                    <div>
                        <div className="text-[8px] uppercase text-gray-500 font-bold">Soil Type</div>
                        <div className="text-xs text-white">Sandy Loam</div>
                    </div>
                </div>
            </div>

            <div className="mt-3 space-y-2">
                <div className="flex justify-between items-center bg-red-950/20 p-1.5 rounded border border-red-900/30">
                    <span className="text-[9px] text-red-400 uppercase font-bold">Wave Impact</span>
                    <span className="text-[9px] text-red-500 font-black">HIGH</span>
                </div>
                <div>
                    <div className="text-[8px] uppercase text-gray-500 font-bold mb-1">Infrastructure at Risk</div>
                    <div className="text-[10px] text-gray-300 leading-tight">Highway 1, Residential Zone B</div>
                </div>
            </div>
        </div>
    </motion.div>
);

// Floating Layers Widget (Top Right)
const LayersWidget = () => (
    <div className="absolute top-6 right-[320px] bg-[#0f172a]/80 backdrop-blur-md border border-gray-700 rounded-lg p-3 z-[400]">
        <div className="flex justify-between items-center mb-2 gap-4">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Layers</span>
            <span className="text-gray-600">^</span>
        </div>
        <div className="space-y-1">
            <label className="flex items-center gap-2 cursor-pointer">
                <div className="w-3 h-3 rounded bg-cyan-500 flex items-center justify-center text-[8px] text-black font-bold">✓</div>
                <span className="text-[10px] font-bold text-cyan-100">Erosion Risk</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100">
                <div className="w-3 h-3 rounded border border-gray-600" />
                <span className="text-[10px] font-bold text-gray-400">Sea Level Rise</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100">
                <div className="w-3 h-3 rounded border border-gray-600" />
                <span className="text-[10px] font-bold text-gray-400">Sediment Transport</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer opacity-50 hover:opacity-100">
                <div className="w-3 h-3 rounded border border-gray-600" />
                <span className="text-[10px] font-bold text-gray-400">Historical Change</span>
            </label>
        </div>
    </div>
);

export const PrecisionLayout = ({ children }) => {
    const [currentYear, setCurrentYear] = useState(DEMO_CONFIG.baselineYear);
    const [isPlaying, setIsPlaying] = useState(false);

    // Animation Loop
    useEffect(() => {
        let interval;
        if (isPlaying) {
            interval = setInterval(() => {
                setCurrentYear(prev => {
                    const next = prev + 0.02; // Slower for smoother visual
                    if (next > DEMO_CONFIG.currentYear) {
                        return DEMO_CONFIG.baselineYear;
                    }
                    return next;
                });
            }, 30);
        }
        return () => clearInterval(interval);
    }, [isPlaying]);

    return (
        <div className="relative h-screen w-screen bg-[#020617] overflow-hidden font-sans text-slate-200 selection:bg-cyan-500/30">

            {/* Background Map */}
            <div className="absolute inset-0 z-0">
                {React.Children.map(children, child =>
                    React.cloneElement(child, { currentYear, isPlaying })
                )}
            </div>

            {/* Grid Overlay for "Geospatial" feel */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:100px_100px] pointer-events-none z-[10]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_40%,#020617_95%)] pointer-events-none z-[100]" />

            {/* Search Bar (Top Left) */}
            <div className="absolute top-6 left-6 z-[400] flex flex-col gap-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-2.5 text-gray-500 group-hover:text-cyan-400 transition-colors" size={16} />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="bg-[#0f172a]/80 backdrop-blur-md border border-gray-700 rounded-lg pl-10 pr-4 py-2 w-64 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>

                {/* Compass */}
                <div className="w-16 h-16 rounded-full border border-gray-700 bg-[#0f172a]/50 backdrop-blur flex items-center justify-center relative">
                    <Compass size={32} className="text-gray-400" />
                    <span className="absolute -top-1 text-[8px] font-bold text-gray-500">N</span>
                </div>
            </div>

            {/* Top Right: Layers Widget */}
            <LayersWidget />

            {/* Right Panel: Metrics */}
            <div className="absolute top-6 right-6 bottom-32 z-[400] overflow-visible">
                <PrecisionMetrics currentYear={currentYear} data={METRICS} />
            </div>

            {/* Left Panel: Layers & Filters */}
            <LayersPanel />

            {/* Context Popup (Floating Overlay) */}
            <ContextPopup config={DEMO_CONFIG} />

            {/* Bottom Timeline */}
            <PrecisionTimeline
                timelineData={TIMELINE_DATA}
                currentYear={currentYear}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying(!isPlaying)}
                onYearChange={(y) => setCurrentYear(y)}
                baselineYear={DEMO_CONFIG.baselineYear}
            />
        </div>
    );
};
