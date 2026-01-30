import React from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

interface StatCardProps {
    label: string;
    value: string;
    trend?: string;
    trendDirection?: 'up' | 'down';
    icon?: React.ReactNode;
    alertLvl?: 'safe' | 'warning' | 'critical';
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, trendDirection, icon, alertLvl }) => (
    <div className={`p-4 rounded-xl border backdrop-blur-md relative overflow-hidden group transition-all duration-300
    ${alertLvl === 'critical' ? 'bg-red-950/20 border-red-900/50 hover:border-red-500/50' :
            alertLvl === 'warning' ? 'bg-orange-950/20 border-orange-900/50 hover:border-orange-500/50' :
                'bg-gray-900/40 border-gray-800 hover:border-cyan-500/30'
        }
  `}>
        <div className="flex justify-between items-start mb-2">
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">{label}</span>
            <div className={`text-gray-400 group-hover:scale-110 transition-transform ${alertLvl === 'critical' ? 'text-red-500' : 'text-cyan-500'}`}>
                {icon}
            </div>
        </div>
        <div className="text-3xl font-black text-white tracking-tight flex items-end gap-2">
            {value}
            {trend && (
                <span className={`text-xs font-bold mb-1.5 flex items-center gap-1
          ${trendDirection === 'down' ? 'text-red-400' : 'text-green-400'}
        `}>
                    {trendDirection === 'down' ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                    {trend}
                </span>
            )}
        </div>
        {/* Decorative glow */}
        <div className={`absolute -bottom-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-10 
      ${alertLvl === 'critical' ? 'bg-red-500' : 'bg-cyan-500'}`}
        />
    </div>
);

export interface StatPanelProps {
    data?: {
        netErosion: string;
        maxDisplacement: string;
        riskLevel: string;
        erosionTrend: string; // e.g. "12% vs LY"
        isDemo?: boolean;
    };
    loading?: boolean;
}

export const StatPanel: React.FC<StatPanelProps> = ({ data, loading }) => {
    if (loading) return <div className="p-4 text-center text-cyan-500 animate-pulse">Analyzing Pattern...</div>;
    if (!data) return null;

    return (
        <div className="grid grid-cols-1 gap-4">
            {data.isDemo && (
                <div className="bg-cyan-900/40 border border-cyan-800 text-cyan-400 text-[10px] font-bold uppercase tracking-widest text-center py-2 rounded-lg glow-text-cyan">
                    Simulated Demo Data
                </div>
            )}
            <StatCard
                label="Net Erosion (YTD)"
                value={data.netErosion}
                trend={data.erosionTrend}
                trendDirection="down"
                alertLvl="critical"
                icon={<TrendingDown size={18} />}
            />
            <StatCard
                label="Max Displacement"
                value={data.maxDisplacement}
                trend="Stable"
                trendDirection="up"
                icon={<ArrowRight size={18} />}
            />
            <StatCard
                label="Risk Level"
                value={data.riskLevel}
                alertLvl={data.riskLevel === 'HIGH' || data.riskLevel === 'CRITICAL' ? 'critical' : 'warning'}
                icon={<AlertTriangle size={18} />}
            />
        </div>
    );
};
