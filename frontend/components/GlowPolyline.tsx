import React from 'react';
import { GeoJSON } from 'react-leaflet';
import { PathOptions } from 'leaflet';

interface GlowPolylineProps {
    data: any;
    color: string;
    glowColor?: string;
    opacity?: number;
    weight?: number;
}

export const GlowPolyline: React.FC<GlowPolylineProps> = ({
    data,
    color,
    glowColor,
    opacity = 1,
    weight = 3
}) => {
    if (!data) return null;

    const mainStyle: PathOptions = {
        color: color,
        weight: weight,
        opacity: opacity,
        lineCap: 'round',
        lineJoin: 'round'
    };

    const glowStyle: PathOptions = {
        color: glowColor || color,
        weight: weight * 4,
        opacity: 0.2,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'blur-[2px]' // Using Tailwind class for blur if supported, or handled via CSS
    };

    return (
        <>
            {/* Glow Layer */}
            <GeoJSON data={data} style={glowStyle} interactive={false} />
            {/* Main Line Layer */}
            <GeoJSON data={data} style={mainStyle} interactive={false} />
        </>
    );
};
