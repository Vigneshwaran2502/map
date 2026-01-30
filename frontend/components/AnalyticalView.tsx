import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { fetchGeoJSON } from '../services/api';
import { GlowPolyline } from './GlowPolyline';
import { HeatmapLayer } from './HeatmapLayer';
import { StatPanel } from './analytical/StatPanel';
import { TrendChart } from './analytical/TrendChart';
import { TimeSlider } from './analytical/TimeSlider';
import { YEARS } from '../types';

interface AnalyticalViewProps {
    site: string;
    baselineYear: number;
    targetYear: number;
    heatmapPoints?: number[][];
    onYearChange: (year: number) => void;
}

const SyncMap: React.FC<{ site: string }> = ({ site }) => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        if (site === 'A') map.setView([19.0760, 72.8777], 13);
        else if (site === 'C') map.setView([19.2000, 72.9781], 13);
    }, [site, map]);
    return null;
}

export const AnalyticalView: React.FC<AnalyticalViewProps> = ({
    site,
    baselineYear,
    targetYear,
    heatmapPoints,
    onYearChange
}) => {
    const [baselineData, setBaselineData] = useState<any>(null);
    const [targetData, setTargetData] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // Force map resize to fix grey tiles issue
    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);
    }, []);

    // Animation Loop
    useEffect(() => {
        let interval: any;
        if (isPlaying) {
            interval = setInterval(() => {
                onYearChange(targetYear >= 2020 ? 2011 : targetYear + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isPlaying, targetYear, onYearChange]);

    useEffect(() => {
        // Fetch specifically the layers needed for this view
        const baseLayer = `Site${site}_${baselineYear}_Shoreline`;
        const targetLayer = `Site${site}_${targetYear}_Shoreline`;

        Promise.all([
            fetchGeoJSON(baseLayer),
            fetchGeoJSON(targetLayer)
        ]).then(([base, target]) => {
            setBaselineData(base);
            setTargetData(target);
        }).catch(console.error);
    }, [site, baselineYear, targetYear]);

    // Dark Matter basemap for high-contrast dashboard
    const basemapUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";

    return (
        <div className="flex h-full w-full flex-col bg-gray-950 overflow-hidden relative">

            {/* Main Content Area */}
            <div className="flex-1 flex flex-row relative overflow-hidden">

                {/* LARGE CENTRAL MAP */}
                <div className="flex-1 relative z-0">
                    <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: '100%', width: '100%', background: '#020617' }} zoomControl={false}>
                        <SyncMap site={site} />
                        <TileLayer
                            url={basemapUrl}
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />

                        {/* Visual Layers Unified */}
                        {baselineData && (
                            <GlowPolyline data={baselineData} color="#ef4444" weight={2} opacity={0.5} />
                        )}
                        {targetData && (
                            <GlowPolyline data={targetData} color="#22d3ee" weight={4} opacity={1} />
                        )}
                        {heatmapPoints && <HeatmapLayer points={heatmapPoints} />}

                    </MapContainer>

                    {/* Floating Map Controls / Overlay Label */}
                    <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                        <div className="px-4 py-2 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-lg shadow-2xl">
                            <h2 className="text-sm font-black uppercase text-white tracking-widest flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                Live Monitoring
                            </h2>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDEBAR - ANALYTICAL PANELS */}
                <div className="w-[380px] bg-gray-900/40 backdrop-blur-xl border-l border-gray-800 flex flex-col overflow-y-auto custom-scrollbar z-10 p-6 space-y-6">
                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-4 border-b border-gray-800 pb-2">Ecological Impact Stats</h3>
                        <StatPanel site={site} />
                    </div>

                    <div>
                        <h3 className="text-xs font-bold uppercase text-gray-500 tracking-widest mb-4 border-b border-gray-800 pb-2">Trend Analysis</h3>
                        <TrendChart />
                    </div>

                    <div className="p-4 bg-blue-900/10 border border-blue-900/30 rounded-xl">
                        <h4 className="text-cyan-400 font-bold text-xs uppercase mb-2">AI Insight</h4>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Accretion patterns in the southern sector suggest a natural sediment shift. Erosion risk remains critical in the northern zone (Sector A-12). Recommended intervention: Mangrove restoration.
                        </p>
                    </div>
                </div>

            </div>

            {/* BOTTOM PANEL - TIME SLIDER */}
            <div className="h-24 bg-gray-900 border-t border-gray-800 z-50">
                <TimeSlider
                    years={YEARS}
                    selectedYear={targetYear}
                    onYearChange={onYearChange}
                    isPlaying={isPlaying}
                    onTogglePlay={() => setIsPlaying(!isPlaying)}
                />
            </div>
        </div>
    );
};
