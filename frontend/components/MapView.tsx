import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, LayersControl } from 'react-leaflet';
import { LayerMetadata } from '../types';
import { fetchGeoJSON } from '../services/api';
import L from 'leaflet';
import { GlowPolyline } from './GlowPolyline';
import { HeatmapLayer } from './HeatmapLayer';
import { DiagnosticsBox } from './DiagnosticsBox';
import { LegendBox } from './LegendBox';
import { TimelineOverlay } from './TimelineOverlay';

// Fix for default Leaflet icons
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapViewProps {
    activeLayers: string[];
    allLayers: LayerMetadata[];
    siteFilter: string;
    heatmapPoints?: number[][];
    debugMode?: boolean;
    animationYear: number;
    isTimeMode: boolean;
    baselineYear: number;
    comparisonYear: number;
}

// Controller to fly to site
const MapController: React.FC<{ site: string }> = ({ site }) => {
    const map = useMap();
    useEffect(() => {
        map.invalidateSize();
        if (site === 'A') map.flyTo([19.0760, 72.8777], 13, { duration: 1.5 });
        else if (site === 'C') map.flyTo([19.2000, 72.9781], 13, { duration: 1.5 });
    }, [site, map]);
    return null;
};

export const MapView: React.FC<MapViewProps> = ({
    activeLayers,
    allLayers,
    siteFilter,
    heatmapPoints,
    debugMode,
    animationYear,
    isTimeMode,
    baselineYear,
    comparisonYear
}) => {
    const [geoData, setGeoData] = useState<Record<string, any>>({});
    const [zoom, setZoom] = useState(13);

    // Force map resize to fix grey tiles issue
    useEffect(() => {
        setTimeout(() => {
            window.dispatchEvent(new Event('resize'));
        }, 500);
    }, []);

    useEffect(() => {
        activeLayers.forEach(layerName => {
            if (!geoData[layerName]) {
                fetchGeoJSON(layerName)
                    .then(data => setGeoData(prev => ({ ...prev, [layerName]: data })))
                    .catch(err => console.error(err));
            }
        });
    }, [activeLayers]);

    // Helper to determine if a layer is the comparison layer (Cyan)
    const isComparisonLayer = (layerName: string) => {
        const meta = allLayers.find(l => l.layer_name === layerName);
        return meta?.year === comparisonYear || meta?.year === animationYear; // Cyan
    };

    const hasHeatmap = !!(heatmapPoints && heatmapPoints.length > 0);

    return (
        <div className="h-full w-full relative z-0">
            <MapContainer
                center={[19.0760, 72.8777]}
                zoom={zoom}
                style={{ height: '100%', width: '100%' }}
                onZoomAnim={(e) => setZoom(e.target.getZoom())}
                zoomControl={false} // Custom zoom control or none for cleaner UI
            >
                <MapController site={siteFilter} />

                <LayersControl position="topright">
                    {/* Esri World Imagery (Standard Satellite) - Default */}
                    <LayersControl.BaseLayer checked name="SAT: Esri World Imagery">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Esri"
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>

                    {/* Google Satellite */}
                    <LayersControl.BaseLayer name="SAT: Google Satellite">
                        <TileLayer
                            url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
                            attribution="Google"
                            maxZoom={20}
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="MAP: Dark Matter">
                        <TileLayer
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                            attribution="CartoDB"
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="MAP: OpenStreetMap">
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="OpenStreetMap"
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>

                    <LayersControl.BaseLayer name="MAP: Terrain (Stamen/USGS)">
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}"
                            attribution="Esri"
                            maxZoom={19}
                        />
                    </LayersControl.BaseLayer>
                </LayersControl>

                {activeLayers.map(layerName => {
                    const data = geoData[layerName];
                    if (!data) return null;

                    const isComp = isComparisonLayer(layerName);
                    const color = isComp ? '#06b6d4' : '#ef4444'; // Cyan vs Red

                    if (isComp) {
                        // Render with Glow
                        return (
                            <GlowPolyline
                                key={layerName}
                                data={data}
                                color={color}
                                glowColor={color}
                                weight={4}
                                opacity={1}
                            />
                        );
                    } else {
                        // Standard Line for Baseline
                        return (
                            <GlowPolyline
                                key={layerName}
                                data={data}
                                color={color}
                                weight={3}
                                opacity={0.8}
                            />
                        );
                    }
                })}

                {heatmapPoints && <HeatmapLayer points={heatmapPoints} />}
            </MapContainer>

            {/* UI Overlays */}
            <LegendBox hasHeatmap={hasHeatmap} />

            {debugMode && (
                <DiagnosticsBox
                    layerName={activeLayers[0]}
                    zoom={zoom}
                    coords={geoData[activeLayers[0]]?.geometry?.coordinates?.[0] || null}
                    warnings={geoData[activeLayers[0]]?.properties?.crs_warning}
                />
            )}

            <TimelineOverlay
                year={animationYear}
                isVisible={isTimeMode || !!heatmapPoints}
                minYear={baselineYear}
                maxYear={comparisonYear}
            />
        </div>
    );
};
