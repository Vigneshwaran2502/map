import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, LayersControl } from 'react-leaflet';
import { LayerMetadata } from '../types';
import { fetchGeoJSON } from '../services/api';
import L from 'leaflet';
import 'leaflet.heat';

// Fix for default Leaflet icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapDataProps {
  activeLayers: string[];
  allLayers: LayerMetadata[];
  siteFilter: string;
  heatmapPoints?: number[][]; // [lat, lng, intensity]
  debugMode?: boolean;
}

// Component to handle flying to site location
const MapController: React.FC<{ site: string }> = ({ site }) => {
  const map = useMap();
  useEffect(() => {
    map.invalidateSize();
    if (site === 'A') map.flyTo([19.0760, 72.8777], 13);
    else if (site === 'C') map.flyTo([19.2000, 72.9781], 13);
  }, [site, map]);
  return null;
};

// Heatmap Layer Component
const HeatmapLayer: React.FC<{ points: number[][] }> = ({ points }) => {
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
      blur: 15,
      maxZoom: 17,
      gradient: { 0.4: 'blue', 0.65: 'lime', 1: 'red' }
    }).addTo(map);
    return () => { map.removeLayer(heat); };
  }, [points, map]);
  return null;
};

// Debug Overlay Component
const DebugOverlay: React.FC<{ activeGeoData: any, zoom: number }> = ({ activeGeoData, zoom }) => {
  if (!activeGeoData) return null;
  const firstLayer = Object.keys(activeGeoData)[0];
  const data = activeGeoData[firstLayer];
  if (!data) return null;

  return (
    <div className="absolute top-20 left-4 z-[1000] bg-black/80 text-green-400 p-3 rounded font-mono text-[10px] border border-green-500/50 backdrop-blur-md">
      <div className="font-bold border-b border-green-500/30 mb-1 pb-1">DEVELOPER DIAGNOSTICS</div>
      <div>LAYER: {firstLayer}</div>
      <div>CRS: {data.properties?.crs || 'EPSG:4326'}</div>
      <div>ZOOM: {zoom}</div>
      <div>COORD: {JSON.stringify(data.properties?.debug_coords)}</div>
      {data.properties?.crs_warning && (
        <div className="text-red-500 mt-1 animate-pulse">⚠️ {data.properties.crs_warning}</div>
      )}
    </div>
  );
};

export const MapData: React.FC<MapDataProps> = ({ activeLayers, allLayers, siteFilter, heatmapPoints, debugMode }) => {
  const [geoData, setGeoData] = useState<Record<string, any>>({});
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    activeLayers.forEach(layerName => {
      if (!geoData[layerName]) {
        fetchGeoJSON(layerName)
          .then(data => setGeoData(prev => ({ ...prev, [layerName]: data })))
          .catch(err => console.error(err));
      }
    });
  }, [activeLayers]);

  const getStyle = (layerName: string) => {
    const meta = allLayers.find(l => l.layer_name === layerName);
    const color = meta?.year === 2011 ? '#ef4444' : '#0ea5e9';
    return {
      color: color,
      weight: 3,
      opacity: 0.8,
      dashArray: meta?.year === 2011 ? '5, 5' : '0'
    };
  };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={[19.0760, 72.8777]}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        onZoomAnim={(e) => setZoom(e.target.getZoom())}
      >
        <MapController site={siteFilter} />

        <LayersControl position="topright">
          {/* Satellite Basemaps - Primary for Coastal Features */}
          <LayersControl.BaseLayer checked name="🛰️ Satellite (Esri World Imagery)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🛰️ Satellite + Labels (Hybrid)">
            <>
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
                maxZoom={19}
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                attribution='&copy; Esri'
                maxZoom={19}
              />
            </>
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌊 Ocean Basemap (Esri)">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
              maxZoom={16}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🗺️ Google Satellite">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}"
              attribution='&copy; Google'
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🗺️ Google Hybrid (Satellite + Roads)">
            <TileLayer
              url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
              attribution='&copy; Google'
              maxZoom={20}
            />
          </LayersControl.BaseLayer>

          {/* Standard Map Basemaps */}
          <LayersControl.BaseLayer name="🗺️ OpenStreetMap">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🌙 Dark Mode (CartoDB)">
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              maxZoom={19}
            />
          </LayersControl.BaseLayer>

          <LayersControl.BaseLayer name="🏖️ Terrain (Stamen)">
            <TileLayer
              url="https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}.jpg"
              attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              subdomains="abcd"
              maxZoom={18}
            />
          </LayersControl.BaseLayer>
        </LayersControl>

        {activeLayers.map(layerName => (
          geoData[layerName] && (
            <GeoJSON
              key={layerName}
              data={geoData[layerName]}
              style={() => getStyle(layerName)}
            />
          )
        ))}

        {heatmapPoints && <HeatmapLayer points={heatmapPoints} />}

        {debugMode && <DebugOverlay activeGeoData={geoData} zoom={zoom} />}

        {/* Legend */}
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control bg-white/90 dark:bg-gray-900/90 p-3 rounded-lg shadow-xl m-4 backdrop-blur-md border border-white/20">
            <h4 className="font-bold text-xs uppercase tracking-wider mb-2 dark:text-gray-200">Shoreline Detection</h4>
            <div className="space-y-1 text-[10px]">
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-red-500 border-b border-dashed"></span>
                <span className="dark:text-gray-400 font-medium">Baseline (2011)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-1 bg-sky-500"></span>
                <span className="dark:text-gray-400 font-medium">Comparison (Target)</span>
              </div>
              {heatmapPoints && (
                <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="font-bold mb-1">Shift Intensity</div>
                  <div className="h-2 w-full bg-gradient-to-r from-blue-500 via-lime-500 to-red-500 rounded"></div>
                  <div className="flex justify-between mt-1 text-[8px] opacity-70">
                    <span>Low Shift</span>
                    <span>High Shift</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
};
