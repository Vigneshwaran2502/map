import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Activity, Ruler, Download, X } from 'lucide-react';

interface ChangeInsightsProps {
    results: any;
    loading: boolean;
    onExport: (format: 'json' | 'csv') => void;
    onClose?: () => void;
}

const StatCard: React.FC<{ label: string; value: string | number; unit: string; icon: any; color: string; subColor: string }> = ({
    label, value, unit, icon: Icon, color, subColor
}) => (
    <div className={`p-4 rounded-xl bg-gray-900/50 border border-gray-800 backdrop-blur-sm relative overflow-hidden group`}>
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-${color}-500`}></div>
        <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
            <div className={`p-1.5 rounded-lg ${subColor}`}>
                <Icon size={14} className={`text-${color}-400`} />
            </div>
        </div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-white tracking-tight">{value}</span>
            <span className="text-[10px] text-gray-500 font-medium">{unit}</span>
        </div>
    </div>
);

export const ChangeInsights: React.FC<ChangeInsightsProps> = ({ results, loading, onExport, onClose }) => {
    if (loading) {
        return (
            <div className="absolute top-4 right-4 z-[1000] w-80 bg-gray-950/90 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-4 h-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin"></div>
                    <span className="text-sm font-medium text-white">Running Coastal Analysis...</span>
                </div>
                <div className="space-y-2">
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 animate-progress"></div>
                    </div>
                    <div className="text-xs text-center text-gray-500">Processing GeoJSON Layers</div>
                </div>
            </div>
        );
    }

    if (!results) return null;

    return (
        <motion.div
            initial={{ x: 350, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 350, opacity: 0 }}
            className="absolute top-4 right-4 z-[1000] w-[22rem] bg-gray-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl flex flex-col max-h-[calc(100vh-2rem)] overflow-hidden"
        >
            {/* Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-gray-900 to-gray-950">
                <div>
                    <h2 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2">
                        <Activity size={14} className="text-cyan-400" />
                        Insights
                    </h2>
                    <div className="text-[10px] text-gray-400 mt-1">
                        {results.site} | {results.baselineYear} vs {results.comparisonYear}
                    </div>
                </div>
                {onClose && (
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X size={16} />
                    </button>
                )}
            </div>

            <div className="p-5 overflow-y-auto custom-scrollbar space-y-6">
                {/* Primary Metrics */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Area Change</h3>
                    <StatCard
                        label="Erosion"
                        value={results.erosionSqm.toLocaleString()}
                        unit="m²"
                        icon={TrendingDown}
                        color="red"
                        subColor="bg-red-500/10"
                    />
                    <StatCard
                        label="Accretion"
                        value={results.accretionSqm.toLocaleString()}
                        unit="m²"
                        icon={TrendingUp}
                        color="emerald"
                        subColor="bg-emerald-500/10"
                    />

                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/20">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-indigo-300 uppercase">Net Change</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${results.netChangeSqm < 0 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                                {results.netChangeSqm < 0 ? 'LOSS' : 'GAIN'}
                            </span>
                        </div>
                        <div className="text-2xl font-bold text-white tracking-tight">
                            {results.netChangeSqm > 0 ? '+' : ''}{results.netChangeSqm.toLocaleString()} <span className="text-sm font-normal text-indigo-200/60">m²</span>
                        </div>
                    </div>
                </div>

                {/* Displacement Metrics */}
                <div className="space-y-3">
                    <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Displacement</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                            <div className="text-[9px] text-gray-400 uppercase mb-1">Max Shift</div>
                            <div className="text-lg font-bold text-white">{results.maxShiftM} <span className="text-[10px] font-normal text-gray-500">m</span></div>
                        </div>
                        <div className="p-3 bg-gray-900/50 rounded-lg border border-gray-800">
                            <div className="text-[9px] text-gray-400 uppercase mb-1">Avg Rate</div>
                            <div className="text-lg font-bold text-white">{results.avgShiftM} <span className="text-[10px] font-normal text-gray-500">m/yr</span></div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button
                        onClick={() => onExport('json')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-colors border border-gray-700"
                    >
                        <Download size={14} /> JSON
                    </button>
                    <button
                        onClick={() => onExport('csv')}
                        className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold rounded-lg transition-colors border border-gray-700"
                    >
                        <Download size={14} /> CSV
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
