
// Precision Demo Data - Extracted from Reference Image

export const DEMO_CONFIG = {
    location: { lat: 34.0522, lng: -118.2437 }, // Mock: Segment A-12
    baselineYear: 2013,
    currentYear: 2024,
    playbackSpeed: 1000,
};

// Values from Screenshot
export const METRICS = {
    netErosion: { start: -10.0, end: -45.0, unit: 'm', trend: '-12%', trendLabel: 'vs. Prior Year' },
    maxDisplacement: { start: 2.0, end: 12.0, unit: 'm', trend: '+5%', trendLabel: 'vs. Prior Year' },
    accretion: { start: 1.0, end: 5.0, unit: 'm', trend: '+2%', trendLabel: 'vs. Prior Year' },
    monitoringStations: { active: 124, total: 127 }
};

export const TIMELINE_DATA = [
    { year: 2013, regional: 8, selected: 8, event: 'Baseline' },
    { year: 2014, regional: 7, selected: 6, event: '' },
    { year: 2015, regional: 5, selected: -2, event: '' },
    { year: 2016, regional: 4, selected: -4, event: '' },
    { year: 2017, regional: 3, selected: -3, event: '' },
    { year: 2018, regional: 2, selected: -5, event: '' },
    { year: 2019, regional: 1, selected: -7, event: '' },
    { year: 2020, regional: 0, selected: -12, event: '' },
    { year: 2021, regional: -1, selected: -15, event: '' },
    { year: 2022, regional: -2, selected: -22, event: '' },
    { year: 2023, regional: -3, selected: -25, event: 'Critical Shift' },
    { year: 2024, regional: -4, selected: -45, event: 'Current' },
    { year: 2025, regional: -5, selected: -50, event: 'Projected' }
];

// Procedural Curve Generator
export const generateCoastline = (yearOffset: number) => {
    const points = [];
    const baseLat = 34.0522;
    const baseLng = -118.2437;
    for (let i = 0; i < 40; i++) {
        const factor = i / 40;
        let lat = baseLat + (i * 0.005);
        let lng = baseLng - Math.sin(factor * Math.PI) * 0.02;

        // Dynamic Erosion on specific segment (around middle)
        const isErodingSegment = i > 15 && i < 25;
        if (isErodingSegment) {
            lng += (yearOffset * 0.0008);
        }

        points.push([lat, lng]);
    }
    return points;
};
