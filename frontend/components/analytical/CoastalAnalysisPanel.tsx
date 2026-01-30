import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingDown, TrendingUp, AlertTriangle, MapPin, Calendar,
    Activity, Waves, Building2, Shield, Zap, X, Anchor, ArrowRight
} from 'lucide-react';

interface AnalysisData {
    region: {
        name: string;
        coastlineLength: string;
        type: 'Urban Beach' | 'Natural Shoreline' | 'Mixed-Use Coast';
        interactionIntensity: 'Low' | 'Moderate' | 'High';
    };
    shorelineChange: {
        trend: 'Erosion' | 'Accretion' | 'Stable';
        displacementRange: string;
        hotspots: string;
    };
    temporalSignal: {
        baselineYear: number;
        comparisonYear: number;
        direction: string;
        signal: 'Accelerating' | 'Stabilizing' | 'Decelerating';
    };
    riskSnapshot: {
        classification: 'Low' | 'Moderate' | 'High';
        infrastructureProx: string;
        sensitivity: string;
    };
    contributingFactors: Array<{
        name: string;
        val: string;
    }>;
    summaryText: string;
}

// Mock intelligence generator
const generateAnalysis = (regionData: any): AnalysisData => {
    return {
        region: {
            name: regionData?.name || 'Selected Sector 4-B',
            coastlineLength: '3.2 km',
            type: 'Mixed-Use Coast',
            interactionIntensity: 'High'
        },
        shorelineChange: {
            trend: 'Erosion',
            displacementRange: '-5.2m to -18.4m',
            hotspots: 'Northern breakwater zone'
        },
        temporalSignal: {
            baselineYear: 2011,
            comparisonYear: 2020,
            direction: 'Landward Retreat',
            signal: 'Accelerating'
        },
        riskSnapshot: {
            classification: 'High',
            infrastructureProx: 'Coastal Hwy within 45m',
            sensitivity: 'High (Dense Urban/Tourism)'
        },
        contributingFactors: [
            { name: 'Wave Exposure', val: 'High (Monsoon dominant)' },
            { name: 'Urban Pressure', val: 'Critical (Encroachment)' },
            { name: 'Sediment Budget', val: 'Deficit (Updrift blocked)' }
        ],
        summaryText: "Selected coastal segment shows moderate shoreline retreat with localized erosion hotspots and elevated urban exposure risk."
    };
};

const SectionHeader = ({ icon, title }: { icon: any, title: string }) => (
    <div className="flex items-center gap-2 mb-3 border-b border-gray-200 pb-1">
        <div className="text-cyan-700">{icon}</div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">{title}</h3>
    </div>
);

const DataRow = ({ label, value, highlight = false }: { label: string; value: string | React.ReactNode; highlight?: boolean }) => (
    <div className="flex justify-between items-start mb-2 group">
        <span className="text-[11px] text-gray-600 group-hover:text-gray-800 transition-colors">{label}</span>
        <span className={`text-[11px] font-bold text-right ${highlight ? 'text-cyan-700' : 'text-gray-800'}`}>{value}</span>
    </div>
);

export const CoastalAnalysisPanel = ({ regionData, onClose }: { regionData?: any; onClose: () => void }) => {
    const [analysis] = useState<AnalysisData>(generateAnalysis(regionData));

    return (
        <motion.div
            initial={{ x: 380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 380, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute top-4 right-4 h-[calc(100vh-2rem)] w-[380px] bg-white/95 backdrop-blur-2xl border border-gray-200 shadow-2xl z-[1000] rounded-2xl overflow-hidden flex flex-col font-sans"
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-white p-4 border-b border-gray-200 flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Zap size={16} className="text-cyan-600" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-900">Coastal Intelligence</h2>
                    </div>
                    <div className="text-[10px] text-gray-400 font-mono">ID: {analysis.region.name}</div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-black transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-6">

                {/* 1. Region Overview */}
                <section>
                    <SectionHeader icon={<MapPin size={14} />} title="Region Overview" />
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <DataRow label="Coastline Length" value={analysis.region.coastlineLength} />
                        <DataRow label="Coastal Type" value={analysis.region.type} />
                        <DataRow
                            label="Interaction Intensity"
                            value={
                                <span className="flex items-center gap-1.5 text-orange-600">
                                    <Activity size={10} />
                                    {analysis.region.interactionIntensity}
                                </span>
                            }
                        />
                    </div>
                </section>

                {/* 2. Shoreline Change Indicators */}
                <section>
                    <SectionHeader icon={<Waves size={14} />} title="Shoreline Change" />
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mb-2">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[11px] text-gray-600">Net Movement Trend</span>
                            <span className="px-2 py-0.5 bg-red-100 border border-red-200 text-red-700 text-[10px] font-bold uppercase rounded flex items-center gap-1">
                                <TrendingDown size={10} />
                                {analysis.shorelineChange.trend}
                            </span>
                        </div>
                        <DataRow label="Displacement Range" value={analysis.shorelineChange.displacementRange} highlight />
                        <DataRow label="Hotspots" value={analysis.shorelineChange.hotspots} />
                    </div>
                </section>

                {/* 3. Temporal Signal */}
                <section>
                    <SectionHeader icon={<Calendar size={14} />} title="Temporal Signal" />
                    <div className="grid grid-cols-2 gap-3 mb-2">
                        <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                            <div className="text-[9px] text-gray-500 uppercase">Comparison</div>
                            <div className="text-xs font-bold text-gray-800">
                                {analysis.temporalSignal.baselineYear} <span className="text-gray-400">→</span> {analysis.temporalSignal.comparisonYear}
                            </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded border border-gray-200 text-center">
                            <div className="text-[9px] text-gray-500 uppercase">Signal</div>
                            <div className="text-xs font-bold text-orange-600 flex items-center justify-center gap-1">
                                <Activity size={10} />
                                {analysis.temporalSignal.signal}
                            </div>
                        </div>
                    </div>
                    <DataRow label="Directional Trend" value={analysis.temporalSignal.direction} />
                </section>

                {/* 4. Risk & Exposure */}
                <section>
                    <SectionHeader icon={<AlertTriangle size={14} />} title="Risk & Exposure Snapshot" />
                    <div className="bg-red-50 border border-red-100 p-3 rounded-lg">
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-[11px] text-red-800/70">Coastal Risk Classification</span>
                            <span className="text-red-700 font-bold text-xs flex items-center gap-1">
                                <Shield size={12} />
                                {analysis.riskSnapshot.classification}
                            </span>
                        </div>
                        <DataRow label="Infrastructure" value={analysis.riskSnapshot.infrastructureProx} />
                        <DataRow label="Sensitivity" value={analysis.riskSnapshot.sensitivity} />
                    </div>
                </section>

                {/* 5. Contributing Factors */}
                <section>
                    <SectionHeader icon={<Anchor size={14} />} title="Contributing Factors (Inferred)" />
                    <div className="space-y-2">
                        {analysis.contributingFactors.map((factor, i) => (
                            <div key={i} className="flex justify-between items-center bg-gray-50 p-2 rounded border border-gray-200">
                                <span className="text-[10px] text-gray-600">{factor.name}</span>
                                <span className="text-[10px] text-gray-800 font-medium">{factor.val}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>

            {/* Footer Summary */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 text-[10px] text-gray-600 italic leading-relaxed">
                <span className="not-italic font-bold text-cyan-700 not-sr-only">AI Insight: </span>
                {analysis.summaryText}
            </div>
        </motion.div>
    );
};
