import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface TrendChartProps {
    history?: { year: number; change: number }[];
    isDemo?: boolean;
}

export const TrendChart: React.FC<TrendChartProps> = ({ history, isDemo }) => {
    // Default mock data if no history provided
    const chartData = history || [
        { year: 2010, change: 0 },
        { year: 2015, change: -12 }, // Simplified
        { year: 2020, change: -45 },
    ];

    return (
        <div className="w-full h-[250px] bg-gray-900/40 border border-gray-800 rounded-xl p-4 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase text-gray-400 tracking-wider">Shoreline Change Trend</h3>
                <div className="flex gap-2">
                    {isDemo && <span className="text-[9px] bg-cyan-900 text-cyan-400 px-1 rounded">DEMO</span>}
                </div>
            </div>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                    <XAxis
                        dataKey="year"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#9ca3af', fontSize: 10 }}
                        unit="m"
                    />
                    <Tooltip
                        contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '8px' }}
                        itemStyle={{ color: '#e5e7eb', fontSize: '12px' }}
                        cursor={{ stroke: '#4b5563', strokeDasharray: '5 5' }}
                    />
                    <Line
                        type="monotone"
                        dataKey="change"
                        stroke="#ef4444"
                        strokeWidth={3}
                        dot={{ r: 4, fill: '#ef4444', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: '#ef4444' }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
