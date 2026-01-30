import React from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, TrendingUp, ArrowDown, Activity, Waves, Mountain } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from 'recharts';
import { TIMELINE_DATA } from '../../data/precisionDemoData';

const Card = ({ title, value, unit, trend, trendLabel, icon: Icon, color, isDownGood = false }) => {
    // Determine color scheme
    const colors = {
        red: 'from-red-900/40 to-transparent border-red-500/30 text-red-500',
        cyan: 'from-cyan-900/40 to-transparent border-cyan-500/30 text-cyan-400',
        blue: 'from-blue-900/40 to-transparent border-blue-500/30 text-blue-400'
    };

    // Parse trend direction (simple logic for demo)
    const isNegative = trend.includes('-');
    const trendColor = isNegative ? 'text-red-400' : 'text-emerald-400';
    const ArrowIcon = isNegative ? TrendingDown : TrendingUp;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`relative p-4 rounded-xl border bg-gradient-to-br ${colors[color]} backdrop-blur-md overflow-hidden group`}
        >
            <div className="flex justify-between items-start mb-1">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
                {Icon && <Icon size={20} className={`${colors[color].split(' ').pop()} opacity-80`} />}
            </div>

            <div className="flex items-end gap-2 mb-2">
                <span className={`text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]`}>
                    {value}
                </span>
                <span className="text-sm font-bold text-gray-500 mb-1">{unit}</span>
                {color === 'red' && <ArrowDown size={24} className="text-red-500 mb-1 ml-auto animate-bounce" />}
            </div>

            <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className={`${trendColor} flex items-center gap-1`}>
                    <ArrowIcon size={10} />
                    {trend}
                </span>
                <span className="text-gray-500 uppercase">{trendLabel}</span>
            </div>
        </motion.div>
    );
};

export const PrecisionMetrics = ({ currentYear, data }) => {
    // Interpolate for smooth numbers
    // Mock logic: assumes 2013-2024 range (11 years)
    const yearIndex = Math.max(0, Math.min(11, currentYear - 2013));
    const factor = yearIndex / 11;

    // Helper to lerp
    const lerp = (start, end) => (start + (end - start) * factor).toFixed(0);

    return (
        <div className="flex flex-col gap-3 w-[280px]">
            {/* Net Erosion */}
            <Card
                title="Net Erosion (YTD)"
                value={lerp(data.netErosion.start, data.netErosion.end)}
                unit={data.netErosion.unit}
                trend="-12%"
                trendLabel="vs. Prior Year"
                color="red"
                icon={null}
            />

            {/* Max Displacement */}
            <Card
                title="Max Displacement"
                value={lerp(data.maxDisplacement.start, data.maxDisplacement.end)}
                unit={data.maxDisplacement.unit}
                trend="+5%"
                trendLabel="vs. Prior Year"
                color="blue"
                icon={Mountain}
            />

            {/* Accretion */}
            <Card
                title="Accretion"
                value={lerp(data.accretion.start, data.accretion.end)}
                unit={data.accretion.unit}
                trend="+2%"
                trendLabel="vs. Prior Year"
                color="cyan"
                icon={Waves}
            />

            {/* Monitoring Stations */}
            <div className="p-4 rounded-xl border border-gray-800 bg-[#0f172a]/90 backdrop-blur-md flex justify-between items-center">
                <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Monitoring Stations</div>
                    <div className="flex items-center gap-2">
                        <span className="text-green-400 font-bold">{data.monitoringStations.active} Active</span>
                        <span className="text-gray-600">/</span>
                        <span className="text-red-400 font-bold">{data.monitoringStations.total - data.monitoringStations.active} Offline</span>
                    </div>
                </div>
                <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse delay-75"></span>
                    <span className="w-2 h-2 rounded-full bg-red-500"></span>
                </div>
            </div>

            {/* Trend Chart (Integrated in Right Panel as per image) */}
            <div className="h-[200px] w-full p-4 rounded-xl border border-gray-800 bg-[#0f172a]/90 backdrop-blur-md">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Shoreline Change Trend ({TIMELINE_DATA.length} Years)</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TIMELINE_DATA}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                        <XAxis
                            dataKey="year"
                            tick={{ fill: '#64748b', fontSize: 9 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            hide
                            domain={[-30, 10]}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                            itemStyle={{ fontSize: '10px' }}
                        />
                        <Legend iconSize={8} wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                        <Line
                            name="Regional Average"
                            type="monotone"
                            dataKey="regional"
                            stroke="#06b6d4"
                            strokeWidth={2}
                            dot={{ r: 2, fill: '#06b6d4' }}
                        />
                        <Line
                            name="Selected Segment"
                            type="monotone"
                            dataKey="selected"
                            stroke="#ef4444"
                            strokeWidth={2}
                            dot={{ r: 2, fill: '#ef4444' }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
