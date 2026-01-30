import React, { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { DEMO_CONFIG, generateCoastline } from '../../data/precisionDemoData';
import { GlowPolyline } from '../GlowPolyline';

// Controller to maintain view
const MapController = () => {
    const map = useMap();
    useEffect(() => {
        map.setView([DEMO_CONFIG.location.lat, DEMO_CONFIG.location.lng], 15);
        map.invalidateSize();
    }, [map]);
    return null;
};

// Procedural Animated Layer
const AnimatedCoastline = ({ currentYear }) => {
    // Generate coastline based on fractional year
    // We memoize generation to avoid calculating too often, or simpler: just calc each render frame if efficient enough.
    // Given 50 points, it's fast.

    const yearOffset = currentYear - DEMO_CONFIG.baselineYear;

    // 1. Historical Baseline (Cyan) - Static 2020
    const baselinePoints = useMemo(() => generateCoastline(0), []); // 0 offset

    // 2. Current/Projected (Red) - Dynamic
    const dynamicPoints = generateCoastline(Math.max(0, yearOffset));

    return (
        <>
            <Polyline
                positions={baselinePoints}
                pathOptions={{
                    color: '#06b6d4',
                    weight: 2,
                    opacity: 0.6,
                    dashArray: '5 10'
                }}
            />

            <GlowPolyline
                data={{
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: dynamicPoints.map(p => [p[1], p[0]]) }
                }}
                color="#ef4444"
                glowColor="#ef4444"
                weight={4}
                opacity={1}
            />
        </>
    );
};

export const PrecisionMap = ({ currentYear }) => {
    return (
        <MapContainer
            center={[DEMO_CONFIG.location.lat, DEMO_CONFIG.location.lng]}
            zoom={15}
            zoomControl={false}
            style={{ height: '100vh', width: '100vw', background: '#020617' }}
        >
            <MapController />

            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution="CartoDB"
                maxZoom={19}
                opacity={0.8}
            />

            <AnimatedCoastline currentYear={currentYear} />

            {/* Simulated Heatmap spots that pulse */}
            {/* We can use simple circle markers that scale with year */}
        </MapContainer>
    );
};
