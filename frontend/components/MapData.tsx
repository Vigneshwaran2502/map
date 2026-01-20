import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { LayerMetadata } from '../types';
import { fetchGeoJSON } from '../services/api';
import L from 'leaflet';

// Fix for default Leaflet icons in React without a bundler
// We point to the unpkg CDN for the assets
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapDataProps {
  activeLayers: string[];
  allLayers: LayerMetadata[];
  siteFilter: string;
}

// Component to handle flying to site location
const MapController: React.FC<{ site: string }> = ({ site }) => {
  const map = useMap();
  useEffect(() => {
    // Force Leaflet to recalculate size when site changes or on mount
    // Small timeout ensures the DOM has updated for flex layout
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    if (site === 'A') {
      map.flyTo([19.0760, 72.8777], 13); // Mumbai approx
    } else if (site === 'C') {
      map.flyTo([19.2000, 72.9781], 13); // Shifted loc
    } else {
      map.flyTo([19.13, 72.92], 12); // Center of both
    }

    return () => clearTimeout(timer);
  }, [site, map]);
  return null;
};

export const MapData: React.FC<MapDataProps> = ({ activeLayers, allLayers, siteFilter }) => {
  const [geoData, setGeoData] = useState<Record<string, any>>({});

  // Fetch GeoJSON for active layers
  useEffect(() => {
    activeLayers.forEach(layerName => {
      if (!geoData[layerName]) {
        fetchGeoJSON(layerName)
          .then(data => setGeoData(prev => ({ ...prev, [layerName]: data })))
          .catch(err => console.error(err));
      }
    });
  }, [activeLayers]);

  // Style function
  const getStyle = (layerName: string) => {
    const meta = allLayers.find(l => l.layer_name === layerName);
    const is2011 = meta?.year === 2011;
    const is2019 = meta?.year === 2019;
    
    let color = '#3388ff';
    if (is2011) color = '#ef4444'; // Red for 2011
    if (is2019) color = '#0ea5e9'; // Blue for 2019
    if (meta?.parameter === 'Boundary') color = '#8b5cf6'; // Purple for boundary

    const isLine = meta?.geometry === 'LineString';

    return {
      color: color,
      weight: isLine ? 3 : 1,
      fillColor: color,
      fillOpacity: isLine ? 0 : 0.4,
      dashArray: is2011 ? '5, 5' : '1', // Dash for older data
    };
  };

  const onEachFeature = (layerName: string) => (feature: any, layer: L.Layer) => {
    const meta = allLayers.find(l => l.layer_name === layerName);
    if (meta) {
        layer.bindPopup(`
            <div class="font-sans text-sm">
                <h3 class="font-bold border-b pb-1 mb-1">${meta.layer_name}</h3>
                <p><b>Site:</b> ${meta.site}</p>
                <p><b>Year:</b> ${meta.year}</p>
                <p><b>Type:</b> ${meta.parameter}</p>
            </div>
        `);
    }
  };

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer 
        center={[19.0760, 72.8777]} 
        zoom={12} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%' }}
      >
        <MapController site={siteFilter} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {activeLayers.map(layerName => (
          geoData[layerName] && (
            <GeoJSON 
              key={layerName} 
              data={geoData[layerName]} 
              style={() => getStyle(layerName)}
              onEachFeature={onEachFeature(layerName)}
            />
          )
        ))}

        {/* Legend */}
        <div className="leaflet-bottom leaflet-right">
          <div className="leaflet-control leaflet-bar bg-white dark:bg-gray-800 p-3 rounded shadow-lg m-4 opacity-90 text-xs">
            <h4 className="font-bold mb-2 dark:text-gray-200">Legend</h4>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-4 h-1 bg-red-500 inline-block border-b-2 border-dashed border-red-500"></span>
              <span className="dark:text-gray-300">2011 (Dashed)</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
               <span className="w-4 h-1 bg-sky-500 inline-block"></span>
               <span className="dark:text-gray-300">2019 (Solid)</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-4 h-4 bg-purple-500 opacity-50 inline-block"></span>
               <span className="dark:text-gray-300">Boundary</span>
            </div>
          </div>
        </div>
      </MapContainer>
    </div>
  );
};
