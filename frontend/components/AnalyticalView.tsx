import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { fetchGeoJSON } from '../services/api';
import { GlowPolyline } from './GlowPolyline';
import { HeatmapLayer } from './HeatmapLayer';

interface AnalyticalViewProps {
    site: string;
    baselineYear: number;
    targetYear: number;
    heatmapPoints?: number[][];
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
    heatmapPoints
}) => {
    const [baselineData, setBaselineData] = useState<any>(null);
    const [targetData, setTargetData] = useState<any>(null);

    // Force map resize to fix grey tiles issue
    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);
    }, []);

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

    const mapStyle = { height: '100%', width: '100%', background: '#f8fafc' };

    // Positron (Light Gray) for clean analytics
    const basemapUrl = "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    return (
        <div className="flex h-full w-full flex-col bg-white dark:bg-gray-950">
            <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
                <h2 className="text-xl font-bold uppercase tracking-widest text-gray-800 dark:text-white">
                    Analytical Precision
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Variation Highlighting Techniques
                </p>
            </div>

            <div className="flex-1 flex flex-row divide-x divide-gray-200 dark:divide-gray-800">
                {/* LEFT PANE: OVERLAY VIEW */}
                <div className="flex-1 relative flex flex-col">
                    <div className="absolute top-0 left-0 right-0 z-[500] bg-gray-100/90 dark:bg-gray-800/90 px-4 py-2 text-xs font-bold uppercase border-b border-gray-300 dark:border-gray-700 shadow-sm backdrop-blur">
                        Overlay View
                    </div>
                    <MapContainer center={[19.0760, 72.8777]} zoom={13} style={mapStyle} zoomControl={false}>
                        <SyncMap site={site} />
                        <TileLayer url={basemapUrl} />

                        {baselineData && (
                            <GlowPolyline data={baselineData} color="#ef4444" weight={3} opacity={0.6} />
                        )}
                        {targetData && (
                            <GlowPolyline data={targetData} color="#06b6d4" weight={4} opacity={1} />
                        )}
                    </MapContainer>
                    <div className="p-3 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                        Side-by-side comparison of historical positions (Red: {baselineYear} vs Cyan: {targetYear}).
                    </div>
                </div>

                {/* RIGHT PANE: DIFFERENTIAL VIEW */}
                <div className="flex-1 relative flex flex-col">
                    <div className="absolute top-0 left-0 right-0 z-[500] bg-gray-100/90 dark:bg-gray-800/90 px-4 py-2 text-xs font-bold uppercase border-b border-gray-300 dark:border-gray-700 shadow-sm backdrop-blur">
                        Differential View
                    </div>
                    <MapContainer center={[19.0760, 72.8777]} zoom={13} style={mapStyle} zoomControl={false}>
                        <SyncMap site={site} />
                        <TileLayer url={basemapUrl} />

                        {/* Show target line as reference */}
                        {targetData && (
                            <GlowPolyline data={targetData} color="#06b6d4" weight={2} opacity={0.3} />
                        )}

                        {/* Heatmap */}
                        {heatmapPoints && <HeatmapLayer points={heatmapPoints} />}

                    </MapContainer>
                    <div className="p-3 bg-white dark:bg-gray-900 text-xs text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-800">
                        Heatmap styling visualizes magnitude of erosion or accretion.
                    </div>
                </div>
            </div>
        </div>
    );
};
