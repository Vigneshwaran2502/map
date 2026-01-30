import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap, LayersControl, useMapEvents, Marker, Popup, Polyline } from 'react-leaflet';
import { LayerMetadata } from '../types';
import { fetchGeoJSON } from '../services/api';
import L from 'leaflet';
import 'leaflet-draw';
import { GlowPolyline } from './GlowPolyline';
import { HeatmapLayer } from './HeatmapLayer';
import { DiagnosticsBox } from './DiagnosticsBox';
import { LegendBox } from './LegendBox';
import { TimelineOverlay } from './TimelineOverlay';
import { StatPanel } from './analytical/StatPanel';
import { TrendChart } from './analytical/TrendChart';
import { CoastalAnalysisPanel } from './analytical/CoastalAnalysisPanel';
import { X } from 'lucide-react';

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
    isPlayground?: boolean;
    activeTool?: 'draw' | 'select' | 'buffer' | null;
    onToolComplete?: () => void;
}

const DrawHandler: React.FC<{
    activeTool: 'draw' | 'select' | 'buffer' | null;
    onComplete: (layer: any) => void;
}> = ({ activeTool, onComplete }) => {
    const map = useMap();
    const [drawHandler, setDrawHandler] = useState<any>(null);

    useEffect(() => {
        if (!activeTool) {
            if (drawHandler) {
                drawHandler.disable();
                setDrawHandler(null);
            }
            return;
        }

        let handler: any;
        if (activeTool === 'draw') {
            handler = new L.Draw.Polyline(map as any, {
                shapeOptions: {
                    color: '#06b6d4',
                    weight: 3,
                    className: 'glow-border-cyan' // Custom class for glow
                }
            });
        } else if (activeTool === 'select' || activeTool === 'buffer') {
            handler = new L.Draw.Polygon(map as any, {
                shapeOptions: {
                    color: '#ef4444',
                    weight: 2,
                    className: 'glow-border-red'
                }
            });
        }

        if (handler) {
            handler.enable();
            setDrawHandler(handler);
        }

        return () => {
            if (handler) handler.disable();
        };
    }, [activeTool, map]);

    useEffect(() => {
        const handleCreated = (e: any) => {
            const layer = e.layer;
            map.addLayer(layer);
            onComplete(layer);
        };

        map.on(L.Draw.Event.CREATED, handleCreated);
        return () => {
            map.off(L.Draw.Event.CREATED, handleCreated);
        };
    }, [map, onComplete]);

    return null;
};

const PlaygroundEvents: React.FC<{ onLocationSelect: (lat: number, lng: number) => void }> = ({ onLocationSelect }) => {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
};

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
    comparisonYear,
    isPlayground,
    activeTool,
    onToolComplete
}) => {
    const [geoData, setGeoData] = useState<Record<string, any>>({});
    const [zoom, setZoom] = useState(13);
    const [playgroundReport, setPlaygroundReport] = useState<any>(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [drawnItems, setDrawnItems] = useState<any[]>([]);

    const handleDrawComplete = (layer: any) => {
        // Mock analysis trigger
        const center = layer.getBounds().getCenter();
        handlePlaygroundClick(center.lat, center.lng);
        if (onToolComplete) onToolComplete();
        // Keep track to clear later if needed, or just let them stay
        setDrawnItems(prev => [...prev, layer]);
    };

    const handlePlaygroundClick = async (lat: number, lng: number) => {
        if (!isPlayground) return;
        setLoadingAnalysis(true);
        setPlaygroundReport(null);
        try {
            const res = await fetch('http://localhost:3001/api/analyze-point', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lat, lng })
            });
            const data = await res.json();
            setPlaygroundReport(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoadingAnalysis(false);
        }
    };

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
                {!isPlayground && <MapController site={siteFilter} />}
                {isPlayground && <PlaygroundEvents onLocationSelect={handlePlaygroundClick} />}
                {isPlayground && <DrawHandler activeTool={activeTool || null} onComplete={handleDrawComplete} />}

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

                {/* Playground Results */}
                {isPlayground && playgroundReport && (
                    <>
                        <Marker position={[playgroundReport.location.lat, playgroundReport.location.lng]}>
                            <Popup minWidth={300}>
                                <div className="p-2">
                                    <h3 className="font-bold uppercase text-xs text-gray-500 mb-2">Instant Coastal Analysis</h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                                        <div className="bg-gray-100 p-2 rounded">
                                            <div className="font-bold text-gray-500">Risk</div>
                                            <div className={`font-black ${playgroundReport.riskLevel === 'HIGH' ? 'text-red-500' : 'text-yellow-500'}`}>{playgroundReport.riskLevel}</div>
                                        </div>
                                        <div className="bg-gray-100 p-2 rounded">
                                            <div className="font-bold text-gray-500">Erosion Rate</div>
                                            <div className="font-black text-gray-800">{playgroundReport.erosionRate}</div>
                                        </div>
                                    </div>
                                    <div className="text-[10px] text-gray-400">
                                        Generated based on procedural history (2010-2024).
                                    </div>
                                </div>
                            </Popup>
                        </Marker>

                        {playgroundReport.history.map((h: any, i: number) => (
                            <Polyline
                                key={i}
                                positions={h.geometry.coordinates.map((c: any) => [c[1], c[0]])}
                                pathOptions={{
                                    color: i === playgroundReport.history.length - 1 ? '#06b6d4' : '#ef4444', // Cyan for latest, Red for past
                                    weight: i === playgroundReport.history.length - 1 ? 3 : 1,
                                    opacity: 0.7
                                }}
                            />
                        ))}
                    </>
                )}
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

            {/* Contextual Analysis Panel (Floating Right) */}
            {isPlayground && playgroundReport && (
                <CoastalAnalysisPanel
                    regionData={playgroundReport}
                    onClose={() => setPlaygroundReport(null)}
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
