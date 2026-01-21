import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

interface HeatmapLayerProps {
    points: number[][]; // [lat, lng, intensity]
}

export const HeatmapLayer: React.FC<HeatmapLayerProps> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        // Safety check for L.heatLayer (plugin support)
        if (!(L as any).heatLayer) {
            console.warn("Leaflet.heat plugin not found. Skipping heatmap rendering.");
            return;
        }

        // @ts-ignore
        const heat = L.heatLayer(points, {
            radius: 25,
            blur: 20,
            maxZoom: 17,
            gradient: { 0.2: 'blue', 0.5: 'cyan', 0.8: 'lime', 1: 'white' }
        }).addTo(map);

        return () => {
            map.removeLayer(heat);
        };
    }, [points, map]);

    return null;
};
