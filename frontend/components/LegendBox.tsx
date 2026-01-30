import React from 'react';

interface LegendBoxProps {
    hasHeatmap?: boolean;
}

export const LegendBox: React.FC<LegendBoxProps> = ({ hasHeatmap }) => {
    return (
        <div className="leaflet-bottom leaflet-right">
            <div className="leaflet-control bg-white/90 dark:bg-gray-900/90 p-4 rounded-lg shadow-xl m-4 backdrop-blur-md border border-white/20 min-w-[200px]">
                <h4 className="font-bold text-xs uppercase tracking-wider mb-3 text-black border-b border-gray-200 pb-2">
                    Shoreline Detection
                </h4>
                <div className="space-y-2 text-[11px]">
                    <div className="flex items-center gap-3">
                        <span className="w-6 h-1 bg-red-500 rounded-full"></span>
                        <span className="text-gray-700 font-medium">Baseline (2011)</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <span className="absolute w-6 h-2 bg-cyan-500/30 blur-[2px] rounded-full"></span>
                            <span className="w-6 h-1 bg-cyan-600 relative z-10 rounded-full"></span>
                        </div>
                        <span className="text-gray-700 font-medium">Comparison (2020)</span>
                    </div>

                    {hasHeatmap && (
                        <div className="mt-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="font-bold mb-2 dark:text-gray-200">Shift Intensity</div>
                            <div className="h-3 w-full bg-gradient-to-r from-blue-600 via-cyan-400 to-white rounded shadow-inner"></div>
                            <div className="flex justify-between mt-1 text-[9px] text-gray-400 font-medium uppercase tracking-wide">
                                <span>Stable</span>
                                <span>High Erosion</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
