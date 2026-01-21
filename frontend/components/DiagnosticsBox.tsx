import React from 'react';

interface DiagnosticsBoxProps {
    layerName?: string;
    crs?: string;
    zoom?: number;
    coords?: number[] | null;
    warnings?: string | null;
}

export const DiagnosticsBox: React.FC<DiagnosticsBoxProps> = ({
    layerName = 'N/A',
    crs = 'EPSG:4326',
    zoom = 0,
    coords,
    warnings
}) => {
    return (
        <div className="absolute top-24 left-4 z-[1000] bg-black/90 text-green-400 p-4 rounded-md font-mono text-[10px] border border-green-500/50 backdrop-blur-md shadow-2xl max-w-[300px]">
            <div className="font-bold border-b border-green-500/30 mb-2 pb-1 flex justify-between items-center text-xs">
                <span>DEVELOPER DIAGNOSTICS</span>
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <div className="grid grid-cols-[60px_1fr] gap-1">
                <div className="opacity-70">LAYER:</div>
                <div className="truncate" title={layerName}>{layerName}</div>

                <div className="opacity-70">CRS:</div>
                <div>{crs}</div>

                <div className="opacity-70">ZOOM:</div>
                <div>{zoom}</div>

                <div className="opacity-70">COORD:</div>
                <div className="break-all leading-tight">{coords ? `[${coords[1].toFixed(4)}, ${coords[0].toFixed(4)}]` : 'N/A'}</div>
            </div>

            {warnings && (
                <div className="mt-2 pt-2 border-t border-green-500/30 text-amber-400 animate-pulse font-bold">
                    ⚠ {warnings}
                </div>
            )}
        </div>
    );
};
