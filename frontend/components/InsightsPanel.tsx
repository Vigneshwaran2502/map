import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingDown, TrendingUp, Download, Info, AlertTriangle, FileJson, FileSpreadsheet } from 'lucide-react';

interface AnalysisResults {
    site: string;
    baselineYear: number;
    comparisonYear: number;
    maxShiftM: number;
    avgShiftM: number;
    erosionSqm: number;
    accretionSqm: number;
    netChangeSqm: number;
    changedLayers: string[];
}

interface InsightsPanelProps {
    results: AnalysisResults | null;
    loading: boolean;
    onExport: (format: 'json' | 'csv') => void;
    onClose: () => void;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ results, loading, onExport, onClose }) => {
    // Don't render if not loading and no results
    if (!loading && !results) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 20 }}
                className="absolute top-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 shadow-2xl h-full flex flex-col z-[1000] overflow-hidden"
            >
                <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
                    <div>
                        <h2 className="text-xl font-bold dark:text-gray-100 uppercase tracking-tighter">Change Insights</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Coastal Intelligence Analytics</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="space-y-4 animate-pulse">
                            <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                            <div className="h-20 bg-gray-200 dark:bg-gray-800 rounded-xl"></div>
                        </div>
                    ) : results ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-900/30">
                                    <div className="flex items-center gap-2 mb-2 text-red-600 dark:text-red-400">
                                        <TrendingDown size={16} />
                                        <span className="text-[10px] font-bold uppercase">Erosion</span>
                                    </div>
                                    <div className="text-xl font-black text-red-700 dark:text-red-400">
                                        {(results.erosionSqm / 1000).toFixed(2)}k
                                    </div>
                                    <div className="text-[10px] text-red-600/70 dark:text-red-400/70">sq. meters lost</div>
                                </div>

                                <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400">
                                        <TrendingUp size={16} />
                                        <span className="text-[10px] font-bold uppercase">Accretion</span>
                                    </div>
                                    <div className="text-xl font-black text-emerald-700 dark:text-emerald-400">
                                        {(results.accretionSqm / 1000).toFixed(2)}k
                                    </div>
                                    <div className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70">sq. meters gained</div>
                                </div>
                            </div>

                            {/* Net Change Card */}
                            <div className="bg-gray-900 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl">
                                <div className="relative z-10">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Net Coastal Change</div>
                                    <div className="text-3xl font-black mb-1">
                                        {results.netChangeSqm > 0 ? '+' : ''}
                                        {(results.netChangeSqm / 1000).toFixed(2)}k <span className="text-sm font-normal text-gray-400">m²</span>
                                    </div>
                                    <div className="text-[10px] text-gray-500">Comparing {results.baselineYear} → {results.comparisonYear}</div>
                                </div>
                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                    <Info size={40} />
                                </div>
                            </div>

                            {/* Displacement Metrics */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase px-1">Displacement Metrics</h3>
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-4 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Max Shoreline Shift</span>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{results.maxShiftM.toFixed(1)}m</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs text-gray-500">Average Annual Rate</span>
                                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                            {(results.avgShiftM / (results.comparisonYear - results.baselineYear)).toFixed(2)}m/yr
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Layers List */}
                            <div className="space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase px-1">Analyzed Layers</h3>
                                <div className="space-y-2">
                                    {(results.changedLayers || []).map(l => (
                                        <div key={l} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-[10px] font-mono border border-gray-100 dark:border-gray-700">
                                            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                                            {l}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Export Actions */}
                            <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-3">
                                <h3 className="text-xs font-bold text-gray-400 uppercase px-1">Documentation</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => onExport('json')}
                                        className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-bold"
                                    >
                                        <FileJson size={14} /> JSON Report
                                    </button>
                                    <button
                                        onClick={() => onExport('csv')}
                                        className="flex items-center justify-center gap-2 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-xs font-bold"
                                    >
                                        <FileSpreadsheet size={14} /> CSV Metrics
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                <AlertTriangle size={32} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-700 dark:text-gray-300">No Analysis Data</h3>
                                <p className="text-xs text-gray-500 max-w-[200px] mt-1">Select a year range and run the shoreline change analysis to see metrics.</p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
